import moduleAlias from 'module-alias';
import * as path from 'path';

if (process.env.NODE_ENV !== 'production') {
  // We are in ts-node-env watch. Just set @ to up one directory
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..', '..'),
  });
} else require('module-alias/register');

import * as dotenv from 'dotenv';

import { promises as fsPromises } from 'fs';
import { Config } from '@/core/config/config';

const GLOBAL_SERVICE_NAME = 'global';
const ROOT_DIR = path.join(__dirname, '../../../');
const BASE_DIR = path.join('env');
const SERVICES_LOCATION = path.join('');
const KUBERNETES_CONFIG_PATH = path.join('kubernetes');
const K8S_CONFIG_LABEL = '-config';
const SECRETS = 'secrets';

const environment = process.argv[2];

async function main() {
  const mainConfig = parseEnvFile(`.${environment}.config.env`);
  const secretsConfig = parseEnvFile(`.${environment}.secrets.env`);

  if (!mainConfig)
    throw new Error(`Config file not found: .${environment}.config.env`);
  if (!secretsConfig)
    throw new Error(`Config file not found: .${environment}.secrets.env`);

  // Generate configs for services
  const services = getServices(mainConfig);
  services.forEach(async (service) => {
    class ServiceConfig extends Config {
      constructor () {
        super(service, environment);
      }
    }
    const serviceConfig = new ServiceConfig();
    if (service === GLOBAL_SERVICE_NAME) {
      await writeKubernetesConfig(
        service,
        serviceConfig.config,
        KUBERNETES_CONFIG_PATH
      );
    } else {
      await writeKubernetesConfig(service, serviceConfig.config);
    }
  });

  // Genererate configs for secrets
  class SecretsConfig extends Config {
    constructor () {
      super(SECRETS, environment);
    }
  }
  const { config } = new SecretsConfig();
  await writeKubernetesSecrets(config, KUBERNETES_CONFIG_PATH);
}

function parseEnvFile(file: string): dotenv.DotenvParseOutput {
  return dotenv.config({
    path: path.join(ROOT_DIR, path.join(BASE_DIR, file)),
  }).parsed;
}

function getServices(parsed: dotenv.DotenvParseOptions) {
  const services = Object.keys(parsed)
    .map((k) => k.substring(0, k.indexOf('.')))
    .filter((k) => !!k);
  return services.filter((k, i) => services.indexOf(k) === i);
}

async function writeKubernetesConfig(
  service: string,
  configs: Record<string, string>,
  directory = path.join(SERVICES_LOCATION, service)
) {
  const filePath = path.join(
    ROOT_DIR,
    directory,
    `${service}${K8S_CONFIG_LABEL}.yaml`
  );
  let data = '';
  Object.keys(configs).forEach((key) => {
    data += `  ${key}: "${configs[key]}"\n`;
  });
  const fileContent = generateK8sConfig(
    `${service}${K8S_CONFIG_LABEL}`,
    data
  );
  await fsPromises.writeFile(filePath, fileContent);
}

async function writeKubernetesSecrets(
  configs: Record<string, string>,
  directory: string
) {
  const filePath = path.join(ROOT_DIR, directory, `${SECRETS}.yaml`);
  let data = '';
  Object.keys(configs).forEach((key) => {
    data += `  ${key}: "${configs[key]}"\n`;
  });
  const fileContent = generateK8sSecret(SECRETS, data);
  await fsPromises.writeFile(filePath, fileContent);
}

function generateK8sConfig(name: string, data: string) {
  return `apiVersion: v1
  kind: ConfigMap
  metadata:
    name: ${name}
  data:
  ${data}
  `;
}

function generateK8sSecret(name: string, data: string) {
  return `apiVersion: v1
  kind: Secret
  metadata:
    name: ${name}
  type: Opaque
  stringData:
  ${data}
  `;
}

main();
