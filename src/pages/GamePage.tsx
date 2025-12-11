import { useParams } from "react-router-dom";
import { TypographyH1 } from "@/components/ui/typography"

export default function GamePage() {
    const { id } = useParams();

    return <TypographyH1 text={`Page de la partie ${id}`}></TypographyH1>;
}
