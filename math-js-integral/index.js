import { create, all } from "mathjs";
import createIntegral from "./math-js-integral.js";

const math = create(all);
math.import([[createIntegral]]); //simulates importing the npm package, which nests it [[]]

export default {
    integrate: math.integrate,
    evaluate: math.evaluate
}