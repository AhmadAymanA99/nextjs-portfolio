import { parseISO, format } from "date-fns";

export default function Date({ dateString }) {
    const date = parseISO(dateString);

    return dateString === "now" ? "now" : <time dateTime={dateString}>{format(date, "MMM d, yyyy")}</time>;
}
