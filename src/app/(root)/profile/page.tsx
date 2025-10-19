import { ProfileForm } from "@/components/shared";
import { getUserSession } from "@/lib/get-user-session";
import { redirect } from "next/navigation";
import { prisma } from "../../../../prisma/prisma-client";

export default async function ProfilePage() {
	//
	const session = await getUserSession();

	if (!session) {
		return redirect("/not-auth");
	}

	const user = await prisma.user.findFirst({ where: { id: session?.id } });
	//

	if (!user) {
		return redirect("/");
	}

	console.log("ProfilePage user", user);

	return <ProfileForm data={user} />;
}
