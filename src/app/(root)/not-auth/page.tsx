import { InfoBlock } from "@/components/shared";

export default function UnauthorizedPage() {
	return (
		<div className="flex flex-col items-center justify-center mt-20 ">
			<InfoBlock
				title="Accesso negato"
				text="Questa pagina può essere vista solo da utenti autorizzati"
				imageUrl="/assets/images/lock.png"
			/>
		</div>
	);
}
