import 'reflect-metadata';
import moduleAlias from 'module-alias';
import path from 'path';

if (process.env['global.environment'] === 'dev' || !process.env['global.environment']) {
  moduleAlias.addAliases({
    '@': path.resolve(__dirname, '..'),
  });
} else require('module-alias/register');

import { DI, GlobalConfig, BaseLogger, GLOBAL_CONFIG, LOGGER_TYPE } from '@infragis/common/';

import { AdminServer } from '@/main/server';
import { CreateKafkaTopics } from '@/application';

DI.registerProviders(AdminServer, CreateKafkaTopics);

// Singletons
DI.registerSingleton(GLOBAL_CONFIG, GlobalConfig);
DI.registerSingleton(LOGGER_TYPE, BaseLogger);

// Start execution
DI.bootstrap(AdminServer);
