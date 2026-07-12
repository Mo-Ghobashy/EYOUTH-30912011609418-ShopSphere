import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { categoriesApi, productsApi, statsApi } from '../api/endpoints';
import { queryKeys } from '../api/queryKeys';
import { BentoCard } from '../components/BentoCard';
import { ErrorState } from '../components/ErrorState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import type { Category, Product } from '../types';
import { formatPrice } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import { getImageUrl } from '../utils/image';

type Tab = 'stats' | 'products' | 'categories' | 'activity';

const emptyProductForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
};

const emptyCategoryForm = {
  name: '',
  slug: '',
};

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('stats');
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const statsQuery = useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => statsApi.get().then((res) => res.data),
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.list().then((res) => res.data.data),
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list({ limit: 100, sort: 'newest' }),
    queryFn: () => productsApi.list({ limit: 100, sort: 'newest' }).then((res) => res.data),
  });

  const invalidateProducts = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
  };

  const invalidateCategories = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
  };

  const productMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock);
      formData.append('categoryId', productForm.categoryId);
      if (imageFile) formData.append('image', imageFile);

      if (editingProduct) {
        return productsApi.update(editingProduct.id, formData);
      }
      return productsApi.create(formData);
    },
    onSuccess: () => {
      setProductForm(emptyProductForm);
      setEditingProduct(null);
      setImageFile(null);
      setFormError(null);
      invalidateProducts();
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: invalidateProducts,
  });

  const categoryMutation = useMutation({
    mutationFn: async () => {
      if (editingCategory) {
        return categoriesApi.update(editingCategory.id, categoryForm);
      }
      return categoriesApi.create(categoryForm);
    },
    onSuccess: () => {
      setCategoryForm(emptyCategoryForm);
      setEditingCategory(null);
      setFormError(null);
      invalidateCategories();
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: invalidateCategories,
    onError: (error) => setFormError(getErrorMessage(error)),
  });

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: product.categoryId,
    });
    setImageFile(null);
    setTab('products');
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, slug: category.slug });
    setTab('categories');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'stats', label: 'Stats' },
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="space-y-6">
      <BentoCard>
        <h1 className="text-3xl font-bold text-ink">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Manage store inventory and view analytics</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTab(item.id);
                setFormError(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === item.id
                  ? 'bg-ink text-white'
                  : 'bg-canvas text-ink hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </BentoCard>

      {tab === 'stats' && (
        <>
          {statsQuery.isLoading && <LoadingSkeleton className="h-32 w-full" />}
          {statsQuery.error && <ErrorState onRetry={() => void statsQuery.refetch()} />}
          {statsQuery.data && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Products', value: statsQuery.data.totalProducts },
                { label: 'Users', value: statsQuery.data.totalUsers },
                { label: 'Reviews', value: statsQuery.data.totalReviews },
                { label: 'Avg Rating', value: statsQuery.data.averageRating },
              ].map((card) => (
                <BentoCard key={card.label}>
                  <p className="text-sm text-muted">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{card.value}</p>
                </BentoCard>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'products' && (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <BentoCard>
            <h2 className="text-lg font-semibold text-ink">
              {editingProduct ? 'Edit product' : 'Create product'}
            </h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                productMutation.mutate();
              }}
            >
              {(['name', 'description', 'price', 'stock'] as const).map((field) => (
                <label key={field} className="block text-sm capitalize text-muted">
                  {field}
                  <input
                    type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                    value={productForm[field]}
                    onChange={(event) =>
                      setProductForm((prev) => ({ ...prev, [field]: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-ink outline-none"
                    required
                  />
                </label>
              ))}

              <label className="block text-sm text-muted">
                Category
                <select
                  value={productForm.categoryId}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, categoryId: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-ink outline-none"
                  required
                >
                  <option value="">Select category</option>
                  {(categoriesQuery.data ?? []).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-muted">
                Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-sm"
                />
              </label>

              {formError && <p className="text-sm text-red-600">{formError}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={productMutation.isPending}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {productMutation.isPending ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm(emptyProductForm);
                      setImageFile(null);
                    }}
                    className="rounded-full bg-canvas px-5 py-2.5 text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </BentoCard>

          <BentoCard className="overflow-x-auto">
            <h2 className="text-lg font-semibold text-ink">Products</h2>
            {productsQuery.isLoading && <LoadingSkeleton className="mt-4 h-24 w-full" />}
            {productsQuery.data && (
              <table className="mt-4 w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-canvas text-muted">
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Price</th>
                    <th className="py-3 pr-4">Stock</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsQuery.data.data.map((product) => (
                    <tr key={product.id} className="border-b border-canvas/70">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt=""
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                          <span className="font-medium text-ink">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{formatPrice(product.price)}</td>
                      <td className="py-3 pr-4">{product.stock}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditProduct(product)}
                            className="text-accent hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </BentoCard>
        </div>
      )}

      {tab === 'categories' && (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <BentoCard>
            <h2 className="text-lg font-semibold text-ink">
              {editingCategory ? 'Edit category' : 'Create category'}
            </h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                categoryMutation.mutate();
              }}
            >
              <label className="block text-sm text-muted">
                Name
                <input
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-ink outline-none"
                  required
                />
              </label>
              <label className="block text-sm text-muted">
                Slug
                <input
                  value={categoryForm.slug}
                  onChange={(event) =>
                    setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-canvas bg-canvas px-4 py-3 text-ink outline-none"
                  required
                />
              </label>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={categoryMutation.isPending}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  {categoryMutation.isPending ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm(emptyCategoryForm);
                    }}
                    className="rounded-full bg-canvas px-5 py-2.5 text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </BentoCard>

          <BentoCard className="overflow-x-auto">
            <h2 className="text-lg font-semibold text-ink">Categories</h2>
            <table className="mt-4 w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-canvas text-muted">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Slug</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(categoriesQuery.data ?? []).map((category) => (
                  <tr key={category.id} className="border-b border-canvas/70">
                    <td className="py-3 pr-4 font-medium text-ink">{category.name}</td>
                    <td className="py-3 pr-4 text-muted">{category.slug}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditCategory(category)}
                          className="text-accent hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </BentoCard>
        </div>
      )}

      {tab === 'activity' && (
        <BentoCard>
          <h2 className="text-lg font-semibold text-ink">Recent Activity</h2>
          {statsQuery.isLoading && <LoadingSkeleton className="mt-4 h-24 w-full" />}
          {statsQuery.data?.recentActivity.length === 0 && (
            <p className="mt-4 text-sm text-muted">No recent activity.</p>
          )}
          {statsQuery.data && statsQuery.data.recentActivity.length > 0 && (
            <ul className="mt-4 space-y-3">
              {statsQuery.data.recentActivity.map((entry, index) => {
                const activity = entry as {
                  _id?: string;
                  action?: string;
                  userId?: string;
                  createdAt?: string;
                };
                return (
                  <li
                    key={activity._id ?? index}
                    className="rounded-2xl bg-canvas px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-ink">{activity.action ?? 'UNKNOWN'}</span>
                    <span className="mx-2 text-muted">·</span>
                    <span className="text-muted">{activity.userId ?? 'system'}</span>
                    {activity.createdAt && (
                      <span className="mt-1 block text-xs text-muted">
                        {new Date(activity.createdAt).toLocaleString()}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </BentoCard>
      )}
    </div>
  );
}
