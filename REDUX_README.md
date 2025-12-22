# Redux Setup Documentation

This project uses Redux Toolkit for state management with RTK Query for API calls.

## Architecture

### Store Structure
- **store/store.ts**: Main Redux store configuration
- **features/**: Redux slices for local state management
- **services/**: RTK Query APIs for server state management

### APIs
- **subscriptionApi.ts**: Handles subscription-related API calls
- **managementApi.ts**: Handles customers, projects, products, payments, plans, and licenses API calls

### Slices
- **subscriptionSlice.ts**: Local state for subscriptions
- **customerSlice.ts**: Local state for customers
- **projectSlice.ts**: Local state for projects
- **productSlice.ts**: Local state for products
- **paymentSlice.ts**: Local state for payments
- **planSlice.ts**: Local state for plans
- **licenseSlice.ts**: Local state for licenses

## Usage

### Using RTK Query Hooks
```tsx
import { useGetCustomersQuery } from '@/services/managementApi';

function MyComponent() {
  const { data: customers, isLoading, error } = useGetCustomersQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return (
    <div>
      {customers?.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  );
}
```

### Using Redux Slices
```tsx
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setCustomers } from '@/features/customerSlice';

function MyComponent() {
  const customers = useAppSelector(state => state.customers.customers);
  const dispatch = useAppDispatch();

  const handleAddCustomer = (customer) => {
    dispatch(setCustomers([...customers, customer]));
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Mutations
```tsx
import { useCreateCustomerMutation } from '@/services/managementApi';

function MyComponent() {
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const handleSubmit = async (data) => {
    try {
      await createCustomer(data).unwrap();
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form JSX */}
    </form>
  );
}
```

## Environment Variables
- `VITE_SUBSCRIPTION_API_URL`: Base URL for subscription API
- `VITE_MANAGEMENT_API_URL`: Base URL for management API

## Features
- Automatic caching and invalidation with RTK Query
- TypeScript support
- Error handling
- Loading states
- Optimistic updates