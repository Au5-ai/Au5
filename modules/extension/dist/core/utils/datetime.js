export var DateTime;
(function (DateTime) {
    function toHoursAndMinutes(input) {
        const date = typeof input === "string" ? new Date(input) : input;
        const hh = date.getUTCHours().toString().padStart(2, "0");
        const mm = date.getUTCMinutes().toString().padStart(2, "0");
        return `${hh}:${mm}`;
    }
    DateTime.toHoursAndMinutes = toHoursAndMinutes;
})(DateTime || (DateTime = {}));
