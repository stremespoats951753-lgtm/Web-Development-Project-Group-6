export function isImageUrl(value) {
    return (
        typeof value === "string" &&
        (value.startsWith("http://") || value.startsWith("https://"))
    );
}

export default function Avatar({
    value,
    fallback = "GF",
    className = "av green",
    alt = "Avatar",
}) {
    const displayValue = value || fallback;

    return (
        <div className={className}>
            {isImageUrl(displayValue) ? (
                <img className="avatar-img" src={displayValue} alt={alt} />
            ) : (
                displayValue
            )}
        </div>
    );
}