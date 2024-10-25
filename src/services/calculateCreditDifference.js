import ClientError from "./customError.js";

export default function (credits, numberOfLeave) {
    let { used, available } = {...credits.toObject()};

    if (numberOfLeave > 0) {
        if (numberOfLeave > used) throw new ClientError(400, `Should not be greater than the used credits`);

        available += numberOfLeave;
        used -= numberOfLeave;
    } else {
        numberOfLeave *= -1;
        if (numberOfLeave > available) throw new ClientError(400, `Only a maximum of ${available}`);

        available -= numberOfLeave;
        used += numberOfLeave;
    };

    return { used, available };
};