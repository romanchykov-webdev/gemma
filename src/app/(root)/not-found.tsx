import Image from "next/image";
import Link from "next/link";
import notFoundImage from "../../../public/assets/images/not-found.png";

export default function NotFoundPage() {
	return (
		<div className="flex flex-col items-center justify-center mt-40">
			<h1>404 - Page not found</h1>
			<p>The page you are looking for does not exist.</p>
			<Image
				src={notFoundImage}
				alt="404 - Page not found"
				width={300}
				height={300}
				className="object-cover mb-4"
			/>
			<Link href="/" className="text-brand-primary hover:text-brand-hover">
				Go back to the home page
			</Link>
		</div>
	);
}
