# Dashboard Setup Guide

## Database Configuration

**Database Connection Details:**
- Host: 100.12.255.36
- Port: 3306 (MySQL)
- Database: P2P
- Username: user1

## Pages Created

1. **BuyerDashboard** - Order management and approval tracking
2. **VendorRecommendation** - Vendor performance and comparison
3. **PurchaseRequisitionDashboard** - PR status and approval workflow

---

## SQL Queries to Create in AppSmith

### 1. Buyer Dashboard Queries

#### Query: `getOrderMetrics`
```sql
SELECT 
  COUNT(*) as total_orders,
  SUM(amount) as total_spending,
  SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_count
FROM PR_Main
WHERE created_by_date >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

#### Query: `getPendingApprovals`
```sql
SELECT COUNT(*) as approval_count
FROM PR_Main
WHERE status = 'Submitted'
  AND approval_stage < 'Final';
```

#### Query: `getOrders`
```sql
SELECT 
  pr_id as order_id,
  vendor_name,
  amount,
  status,
  created_date
FROM PR_Main
ORDER BY created_date DESC
LIMIT 50;
```

#### Query: `getApprovals`
```sql
SELECT 
  pr_id as req_id,
  amount,
  requestor_name,
  request_date,
  'Review' as action
FROM PR_Main
WHERE status = 'Submitted';
```

---

### 2. Vendor Recommendation Dashboard Queries

#### Query: `getVendorPerformance`
```sql
SELECT 
  vendor_name,
  quality_score,
  delivery_score,
  cost_score,
  ROUND((quality_score + delivery_score + cost_score) / 3, 2) as overall_rating,
  COUNT(pr_id) as total_orders
FROM Vendor_Recommendations v
LEFT JOIN PR_Main p ON v.vendor_id = p.vendor_id
GROUP BY vendor_id, vendor_name, quality_score, delivery_score, cost_score
ORDER BY overall_rating DESC;
```

#### Query: `getCategories`
```sql
SELECT DISTINCT 
  category_id,
  category_name
FROM Vendor_Recommendations
ORDER BY category_name;
```

#### Query: `getRecommendedVendors`
```sql
SELECT 
  vendor_name,
  category as category,
  overall_rating as rating,
  ontime_delivery_percent,
  contact_email
FROM Vendor_Recommendations
WHERE category_id = '${selectCategoryFilter.value}'
ORDER BY overall_rating DESC;
```

#### Query: `getAllVendors`
```sql
SELECT DISTINCT 
  vendor_id,
  vendor_name
FROM Vendor_Recommendations
ORDER BY vendor_name;
```

#### Query: `getVendorComparison`
```sql
SELECT 
  vendor_name,
  quality_score,
  delivery_score,
  cost_score,
  price_per_unit,
  lead_time
FROM Vendor_Recommendations
WHERE vendor_id IN (${multiSelectCompare.value})
ORDER BY overall_rating DESC;
```

---

### 3. Purchase Requisition Dashboard Queries

#### Query: `getPRMetrics`
```sql
SELECT 
  SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft_count,
  SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as submitted_count,
  SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected_count
FROM PR_Main;
```

#### Query: `getPRList`
```sql
SELECT 
  pr_id,
  description,
  amount,
  status,
  requestor_name,
  request_date,
  'View' as view_action
FROM PR_Main
WHERE (pr_id LIKE '%${searchPRFilter.value}%' OR description LIKE '%${searchPRFilter.value}%')
  AND (status = '${filterStatusFilter.value}' OR '${filterStatusFilter.value}' = '')
ORDER BY request_date DESC;
```

#### Query: `getPRWorkflow`
```sql
SELECT 
  pr_id,
  current_approval_stage as current_stage,
  approver_name,
  submitted_date,
  DATEDIFF(NOW(), submitted_date) as days_pending,
  DATE_ADD(submitted_date, INTERVAL 5 DAY) as expected_approval_date
FROM PR_Main
WHERE status = 'Submitted'
ORDER BY submitted_date ASC;
```

---

## Setup Steps in AppSmith

### Step 1: Create Database Connection
1. Go to **DataSources** in AppSmith
2. Click **Create New** → **MySQL**
3. Enter the connection details above
4. Test the connection
5. Save as "P2P_Database"

### Step 2: Create Queries
For each query listed above:
1. Go to the respective page (BuyerDashboard, VendorRecommendation, or PurchaseRequisitionDashboard)
2. Click **+** in the Query Editor
3. Select your database connection
4. Paste the SQL query
5. Name the query (e.g., `getOrderMetrics`)
6. Click Save

### Step 3: Bind Queries to Widgets
1. Select each widget (Table, Statistic, etc.)
2. In the Inspector panel, update the **data** property to reference the query
   - Example: `{{getOrderMetrics.data}}`
3. For tables, update the **columns** to match your actual database column names

### Step 4: Set Up Filters and Pagination
- For search/filter widgets, update their **onChange** events to trigger query re-execution with filters
- Configure pagination for large tables

### Step 5: Test the Dashboards
- Navigate to each page
- Verify data loads correctly
- Test search, filter, and sorting functionality

---

## Widget Names for Reference

**BuyerDashboard:**
- `stat_total_orders`, `stat_total_spending`, `stat_pending_po`, `stat_pending_approvals`
- `table_orders`, `table_approvals`

**VendorRecommendation:**
- `table_vendor_performance`, `select_category`, `table_recommended`
- `multiselect_compare`, `table_comparison`

**PurchaseRequisitionDashboard:**
- `stat_draft`, `stat_submitted`, `stat_approved`, `stat_rejected`
- `search_pr`, `filter_status`, `table_pr_list`
- `table_workflow`

---

## Next Steps

1. Configure the MySQL datasource in AppSmith
2. Create the queries in the Query Editor
3. Adjust column names in tables to match your actual database schema
4. Update filter logic based on your UI widget names
5. Test each dashboard with real data
6. Add navigation buttons to switch between dashboards
7. Customize styling and branding as needed
