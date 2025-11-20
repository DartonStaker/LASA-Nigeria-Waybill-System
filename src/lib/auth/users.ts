import { createHash, timingSafeEqual } from "crypto";

type RawUser = {
  id: string;
  username: string;
  displayName: string;
  password: string;
};

export type SessionUser = {
  id: string;
  username: string;
  displayName: string;
};

type InternalUser = SessionUser & {
  passwordHash: string;
};

const PASSWORD_SALT =
  process.env.AUTH_PASSWORD_SALT || "lasa-waybill-demo-salt";

function hashPassword(password: string, salt: string = PASSWORD_SALT) {
  return createHash("sha256").update(`${password}:${salt}`).digest("hex");
}

const rawUsers: RawUser[] = [
  {
    id: "support",
    username: "support@lasa.africa",
    displayName: "LASA Support",
    password: "@MatCod1!@",
  },
  {
    id: "lawrence",
    username: "Lawrence",
    displayName: "Lawrence",
    password: "@Nigeria123@",
  },
];

const USERS: InternalUser[] = rawUsers.map(({ password, ...rest }) => ({
  ...rest,
  passwordHash: hashPassword(password),
}));

export function findUser(username: string): InternalUser | undefined {
  return USERS.find(
    (user) => user.username.toLowerCase() === username.toLowerCase(),
  );
}

export function verifyUserCredentials(
  username: string,
  password: string,
): SessionUser | null {
  const user = findUser(username);

  if (!user) {
    return null;
  }

  const inputHash = hashPassword(password);
  const storedHashBuffer = Buffer.from(user.passwordHash, "hex");
  const inputHashBuffer = Buffer.from(inputHash, "hex");

  if (
    storedHashBuffer.length === inputHashBuffer.length &&
    timingSafeEqual(storedHashBuffer, inputHashBuffer)
  ) {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    };
  }

  return null;
}

