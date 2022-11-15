import { mount } from '@vue/test-utils';
import Cart from '@/components/Cart.vue';
import LayoutDefault from '@/layouts/default.vue';
import { CartManager } from '@/managers/CartManager';

describe('Default Layout', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(LayoutDefault, {
      mocks: {
        $cart: new CartManager(),
      },
      stubs: {
        Nuxt: true,
      },
    });
  });

  it('Deve montar o Cart', () => {
    const cart = wrapper.findComponent(Cart);
    expect(cart.exists()).toBeTruthy();
  });

  it('Deve abrir o Cart ao clicar no botão', async () => {
    const button = wrapper.find('[data-testid="open-cart"]');
    expect(wrapper.vm.$cart.getState().open).toBe(false);
    await button.trigger('click');
    expect(wrapper.vm.$cart.getState().open).toBe(true);
  });
});
