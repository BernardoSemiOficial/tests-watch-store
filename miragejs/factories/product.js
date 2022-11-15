/*
 * Mirage JS guide on Factories: https://miragejs.com/docs/data-layer/factories
 */
import { Factory } from 'miragejs';

/*
 * Faker Github repository: https://github.com/Marak/Faker.js#readme
 */
import { faker } from '@faker-js/faker';

export default {
  product: Factory.extend({
    title() {
      return faker.commerce.productName();
    },
    image() {
      return faker.image.sports(640, 480, true);
    },
    description() {
      return faker.commerce.productDescription();
    },
    price() {
      return faker.commerce.price(100, 500, 2, 'R$');
    },
  }),
};
