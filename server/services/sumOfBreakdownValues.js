export default (arr, itemName) => {
    return arr.map(items => items[itemName]).reduce((accu, curr) => accu + curr, 0);
};