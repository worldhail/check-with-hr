import Joi from "joi";

export default Joi.object({
    hourTypes: {
        name: Joi.string().required(),
        ratePerHour: Joi.number().required()
    }
});