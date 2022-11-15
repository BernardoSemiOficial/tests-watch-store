import { mount } from '@vue/test-utils';
import { makeServer } from '~/miragejs/server';
import CartItem from '@/components/CartItem.vue';
import { CartManager } from '~/managers/CartManager';

const manager = new CartManager();

describe('CartItem - unit', () => {
  let server;

  const mountCartItem = () => {
    const product = server.create('product', {
      title: 'Futebol',
      price: '22.33',
    });

    const wrapper = mount(CartItem, {
      propsData: {
        product,
      },
      mocks: {
        $cart: manager,
      },
    });

    return { wrapper, product, manager };
  };

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
  });

  it('Deve renderizar o componente', () => {
    const { wrapper } = mountCartItem();
    expect(wrapper.exists()).toBeTruthy();
  });

  it('Deve mostrar as informações do produto', () => {
    const { wrapper, product } = mountCartItem();
    expect(wrapper.text()).toContain(product.title);
    expect(wrapper.text()).toContain(product.price);
  });

  it('Deve mostrar quantidade 1 quando adicionar o produto ao carrinho', () => {
    const { wrapper } = mountCartItem();
    const elQuantity = wrapper.find('[data-testid="quantity"]');
    expect(elQuantity.text()).toEqual('1');
  });

  it('Deve aumentar a quantidade do produto no carrinho', async () => {
    const { wrapper } = mountCartItem();
    const elQuantity = wrapper.find('[data-testid="quantity"]');
    const btnPlus = wrapper.find('[data-testid="button-plus"]');
    expect(elQuantity.text()).toBe('1');
    await btnPlus.trigger('click');
    await btnPlus.trigger('click');
    expect(elQuantity.text()).toBe('3');
  });

  it('Deve diminuir a quantidade do produto no carrinho, e nunca igual a 0', async () => {
    const { wrapper } = mountCartItem();
    const elQuantity = wrapper.find('[data-testid="quantity"]');
    const btnMinus = wrapper.find('[data-testid="button-minus"]');
    const btnPlus = wrapper.find('[data-testid="button-plus"]');
    await btnPlus.trigger('click');
    expect(elQuantity.text()).toBe('2');
    await btnMinus.trigger('click');
    expect(elQuantity.text()).toBe('1');
    await btnMinus.trigger('click');
    expect(elQuantity.text()).toBe('1');
  });

  it('Deve mostrar o botão para remover o item do Cart', () => {
    const { wrapper } = mountCartItem();
    const button = wrapper.find('[data-testid="remove-item"]');
    expect(button.exists()).toBeTruthy();
  });

  it('Deve chamar o Cart Manager removeProduct() quando clicar no botão', async () => {
    const { wrapper, product, manager } = mountCartItem();
    const spyMethod = jest.spyOn(manager, 'removeProduct');

    const button = wrapper.find('[data-testid="remove-item"]');
    await button.trigger('click');

    expect(spyMethod).toBeCalledTimes(1);
    expect(spyMethod).toHaveBeenCalledWith(product.id);
  });
});
