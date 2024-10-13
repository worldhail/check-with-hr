export default function(docs) {
    const documents = Array.from(new Set(docs.map(obj => obj._id.toString())))
        .map(id => docs.find(obj => obj._id.toString() === id));

    return documents;
};