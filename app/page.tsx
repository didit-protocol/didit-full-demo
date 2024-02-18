export const dynamic = "force-dynamic";

import getCurrentUser from "./actions/getCurrentUser";
import Container from "./components/Container";
import Landing from "./components/Landing";
import { AugmentedUser } from "./types";

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  return (
    <Container>
      <Landing currentUser={currentUser as AugmentedUser} />
    </Container>
  );
}
