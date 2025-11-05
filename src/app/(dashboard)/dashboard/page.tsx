import { Container, Title } from "@/components/shared";
import { adminRoles } from "@/constants/auth-options";
import { getUserSession } from "@/lib/get-user-session";
import { redirect } from "next/navigation";
import { prisma } from "../../../../prisma/prisma-client";
import { DashboardClient } from "./components/shared/dashboard-client";

export default async function DashBoardPage() {
	//

	const session = await getUserSession();

	if (!session) {
		return redirect("/not-auth");
	}

	// // ✅ Валидация UUID: проверяем что id корректный (36 символов с дефисами или 32 без)
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

	if (user && !adminRoles.includes(user?.role)) {
		return redirect("/not-auth");
	}

	console.log("ProfilePage user", user.role);

	return (
		<Container className="mt-10">
			<Title text="Admin panel" size="lg" className="font-extrabold text-center" />

			<DashboardClient userRole={user?.role} />
		</Container>
	);
}
