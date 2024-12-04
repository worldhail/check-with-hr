export default function (data) {
    const timeDifference = new Date() - new Date(data.regularizationDate);
    const days = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
    const months = Math.floor(days / 30);

    return months;
};