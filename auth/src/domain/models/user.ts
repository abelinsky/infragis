interface UserProps {
  id: string;
  email: string;
  password: string;
}

export class User {
  constructor(public props: UserProps) {}

  public static create(props: UserProps): User {
    return new User(props);
  }
}
