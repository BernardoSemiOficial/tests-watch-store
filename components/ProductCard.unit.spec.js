import { mount } from '@vue/test-utils';
import ProductCart from '@/components/ProductCard';
import { makeServer } from '@/miragejs/server';

const mountProductCard = (product) => {
  return mount(ProductCart, {
    propsData: {
      product,
    },
  });
};

describe('ProductCard - unit', () => {
  let server;
  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('Deve montar o componente em tela', () => {
    const product = server.create('product');
    const wrapper = mountProductCard(product);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain(product.title);
    expect(wrapper.text()).toContain(product.price);
  });

  it('Deve emitir um evento addToCart e enviar o produto clicado', async () => {
    const product = server.create('product');
    const wrapper = mountProductCard(product);

    await wrapper
      .findComponent('[data-testid="product-card__button--addtocart"')
      .trigger('click');

    expect(wrapper.emitted().addToCart).toBeTruthy();
    expect(wrapper.emitted().addToCart.length).toBe(1);
    expect(wrapper.emitted().addToCart[0]).toEqual([{ product }]);
  });
});
