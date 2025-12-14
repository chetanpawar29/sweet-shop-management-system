# Sweet Shop Management System

A full-stack sweet shop management application with user authentication, inventory management, and role-based access control.

## Features

### For All Users
- **User Authentication**: Register and login with email/password
- **Browse Sweets**: View all available sweets in the shop
- **Search & Filter**: Search by name, category, or description; filter by category and price range
- **Purchase**: Buy sweets (reduces inventory by 1)
- **Real-time Updates**: See current stock levels

### For Admin Users
- **Add Sweets**: Create new sweet products
- **Edit Sweets**: Update existing sweet details
- **Delete Sweets**: Remove sweets from inventory
- **Restock**: Increase inventory quantities
- **Full CRUD Operations**: Complete control over inventory

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Database Schema

### Tables

1. **profiles**: Extended user information
   - Automatically created when user signs up
   - Stores admin status (`is_admin` boolean)

2. **sweets**: Product inventory
   - id, name, category, price, quantity
   - description, image_url
   - Timestamps for tracking

## Creating an Admin User

By default, all new users are created as regular users. To make a user an admin:

### Method 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Table Editor → profiles
3. Find the user's row (by email)
4. Update `is_admin` column to `true`

### Method 2: Using SQL
Run this query in the SQL Editor:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'admin@example.com';
```

## API Operations

The application performs all operations through Supabase's JavaScript client:

### Authentication
- `supabase.auth.signUp()` - Register new user
- `supabase.auth.signInWithPassword()` - Login
- `supabase.auth.signOut()` - Logout

### Sweet Operations
- **Read**: `supabase.from('sweets').select('*')`
- **Create**: `supabase.from('sweets').insert([data])` (Admin only)
- **Update**: `supabase.from('sweets').update(data).eq('id', id)` (Admin only)
- **Delete**: `supabase.from('sweets').delete().eq('id', id)` (Admin only)
- **Purchase**: `supabase.from('sweets').update({ quantity: quantity - 1 })`
- **Restock**: `supabase.from('sweets').update({ quantity: quantity + amount })`

## Security

- **Row Level Security (RLS)** enabled on all tables
- Authentication required for all sweet operations
- Admin-only policies for create, update, delete operations
- Users can only update their own profiles
- All queries validated against RLS policies

## Sample Data

The system includes 8 pre-populated sweets across different categories:
- Chocolate (Milk Chocolate Bar, Dark Chocolate Truffles)
- Gummy (Gummy Bears, Sour Worms)
- Candy (Lollipops, Peppermint Candies)
- Caramel (Caramel Chews)
- Licorice (Licorice Twists)

## User Interface

### For Regular Users
- Clean, modern dashboard with gradient backgrounds
- Search bar and filter dropdowns
- Grid layout of sweet cards
- Purchase button (disabled when out of stock)
- Real-time stock updates

### For Admin Users
- All regular user features
- "ADMIN" badge in header
- "Add Sweet" button
- Edit, Delete, and Restock buttons on each card
- Modal forms for adding/editing sweets
- Restock modal with quantity input

## Testing the Application

1. **Register a new user**
2. **Browse sweets** - view all products
3. **Search** - try searching for "chocolate" or "gummy"
4. **Filter** - filter by category or price range
5. **Purchase** - click purchase on any sweet with stock
6. **Make user admin** - update database to set is_admin = true
7. **Admin features**:
   - Add a new sweet
   - Edit existing sweet
   - Restock items
   - Delete sweets

## Design Highlights

- Pink to orange gradient color scheme
- Smooth transitions and hover effects
- Responsive design (mobile to desktop)
- Loading states and error handling
- Intuitive user experience
- Professional, modern aesthetic
