import { User, Verification } from "@prisma/client";

export interface AugmentedUser extends User {
  lastVerification?: Verification;
}
