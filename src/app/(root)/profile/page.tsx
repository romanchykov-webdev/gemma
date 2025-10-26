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

	// ✅ Валидация UUID: проверяем что id корректный (36 символов с дефисами или 32 без)
	const isValidUUID = session.id && (session.id.length === 36 || session.id.length === 32);

	if (!isValidUUID) {
		console.error("[PROFILE] Invalid UUID format:", session.id);
		// Перенаправляем на главную для повторного логина
		return redirect("/api/auth/signout?callbackUrl=/");
	}

	const user = await prisma.user.findFirst({ where: { id: session.id } });
	//

	if (!user) {
		return redirect("/");
	}

	console.log("ProfilePage user", user);

	return <ProfileForm data={user} />;
}
