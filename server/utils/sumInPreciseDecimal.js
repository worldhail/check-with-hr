export default arr => Number(
    Array.isArray(arr) ? arr.reduce((acc, curr) => acc + curr, 0).toFixed(2)
    : arr.toFixed(2)
);