import { cn } from "@/lib/utils";
import { CircleUser, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { JSX } from "react";
import { Button, Skeleton } from "../ui";

interface Props {
	onClockSignIn: () => void;
	className?: string;
}

export const ProfileButton: React.FC<Props> = ({ className, onClockSignIn }): JSX.Element => {
	//
	const { data: session, status } = useSession();
	// console.log(session);

	if (status === "loading") {
		return <Skeleton className={cn("h-10 w-[110px] rounded-md", className)} />;
	}

	return (
		<div className={cn("", className)}>
			{!session ? (
				<Button onClick={onClockSignIn} variant="outline" className="flex items-center gap-1">
					<User size={16} />
					Login
				</Button>
			) : (
				<Link href="/profile">
					<Button
						// onClick={() => signIn("github", { callbackUrl: "/", redirect: true })}
						variant="outline"
						className="flex items-center gap-1"
					>
						<CircleUser size={16} />
						Profile
					</Button>
				</Link>
			)}
		</div>
	);
};
