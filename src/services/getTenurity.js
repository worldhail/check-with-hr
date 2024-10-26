// CALCULATE THE HIRE DATE INTO THE NUMBER OF MONTHS, AND YEARS
export default function getTenurity (date) {
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const timeDifference = currentDate - date;

    // Convert milliseconds to years and months
    const years = Math.floor(timeDifference / (365 * 24 * 60 * 60 * 1000));
    const months = Math.floor((timeDifference % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000));
    return { years, months };
};