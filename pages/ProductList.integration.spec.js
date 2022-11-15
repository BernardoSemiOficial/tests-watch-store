import Vue from 'vue';
import axios from '@nuxtjs/axios';
import { mount } from '@vue/test-utils';

import ProductList from './index.vue';
import { makeServer } from '@/miragejs/server';
import ProductCard from '@/components/ProductCard.vue';
import Search from '@/components/Search.vue';

jest.mock('@nuxtjs/axios', () => ({
  get: jest.fn(),
}));

describe('ProductList - integration', () => {
  let server;

  const getProducts = (quantity, restProducts) => {
    const products = [
      ...server.createList('product', quantity),
      ...restProducts.map((product) => server.create('product', product)),
    ];
    return products;
  };

  const mountProductList = async (
    quantity = 10,
    restProducts = [],
    shouldReject = false
  ) => {
    const products = getProducts(quantity, restProducts);

    if (shouldReject) {
      // eslint-disable-next-line unicorn/error-message
      axios.get.mockReturnValue(Promise.reject(new Error('')));
    } else {
      axios.get.mockReturnValue(Promise.resolve({ data: { products } }));
    }

    const wrapper = mount(ProductList, {
      mocks: {
        $axios: axios,
      },
    });
    // eslint-disable-next-line import/no-named-as-default-member
    await Vue.nextTick();

    return { wrapper, products };
  };

  beforeEach(() => {
    server = makeServer({ environment: 'test' });
  });

  afterEach(() => {
    server.shutdown();
    jest.clearAllMocks();
  });

  it('Deve montar o componente em tela', async () => {
    const { wrapper } = await mountProductList();
    expect(wrapper.exists()).toBeTruthy();
  });

  it('Deve montar o componente Search como filho de ProductList', async () => {
    const { wrapper } = await mountProductList();
    expect(wrapper.findComponent(Search).exists()).toBeTruthy();
  });

  it('Deve chamar o $axios.get ao criar o componente', async () => {
    await mountProductList();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/products');
  });

  it('Deve montar o componente ProductCard 10x como filho de ProductList', async () => {
    const { wrapper } = await mountProductList();
    const cards = wrapper.findAllComponents(ProductCard);
    expect(cards).toHaveLength(10);
  });

  it('Deve mostrar a mensagem de erro ao falhar a busca por produtos', async () => {
    const { wrapper } = await mountProductList(10, [], true);
    const errorMessage = wrapper.text();
    expect(errorMessage).toContain('Problema as carregar a lista.');
  });

  it('Deve filtrar os produtos da lista quando for pesquisado', async () => {
    const { wrapper } = await mountProductList(10, [{ title: 'Futebol' }]);
    const search = wrapper.findComponent(Search);
    search.find('[data-testid="search-form__input"]').setValue('Futebol');
    await search.find('form').trigger('submit');

    const cards = wrapper.findAllComponents(ProductCard);
    expect(cards).toHaveLength(1);
    expect(cards.at(0).text()).toContain('Futebol');
    expect(wrapper.vm.searchTerm).toEqual('Futebol');
  });

  it('Deve retornar todos produtos da lista quando o campo ficar vazio', async () => {
    const { wrapper } = await mountProductList(10, [{ title: 'Futebol' }]);

    const search = wrapper.findComponent(Search);
    search.find('[data-testid="search-form__input"]').setValue('Futebol');
    await search.find('form').trigger('submit');
    search.find('[data-testid="search-form__input"]').setValue('');
    await search.find('form').trigger('submit');

    const cards = wrapper.findAllComponents(ProductCard);
    expect(cards).toHaveLength(11);
    expect(cards.at(0).text()).toContain('');
    expect(wrapper.vm.searchTerm).toEqual('');
  });

  it('Deve mostrar o singular e o plural na quantidade de produtos exibidos', async () => {
    const { wrapper: wrapper1, products: products1 } = await mountProductList(
      1
    );
    const { wrapper: wrapper2, products: products2 } = await mountProductList(
      10
    );
    const totalProducts1 = wrapper1.find('[data-testid="total-products"]');
    const totalProducts2 = wrapper2.find('[data-testid="total-products"]');
    expect(totalProducts1.text()).toEqual(`${products1.length} Product`);
    expect(totalProducts2.text()).toEqual(`${products2.length} Products`);
  });
});
