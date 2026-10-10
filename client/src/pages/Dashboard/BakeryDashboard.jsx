//Import dashboard overview styles
import "./styles/DashboardOverview.css";

//Used for dashboard navigation
import { useNavigate } from "react-router-dom";

//Import dashboard statistic icons
import {
    DollarSign,
    ShoppingCart,
    ReceiptText,
    UserPlus,
    Plus
} from "lucide-react";

//Import reusable dashboard components
import DashboardStatCard from "../../components/BakeryOwner/dashboard/DashboardStatCard";

//Displays the Bakery Owner dashboard overview
export default function BakeryDashboard() {

    //Used to navigate to other Bakery Owner pages
    const navigate = useNavigate();

    return (
        <div className="bakery-dashboard-content">

            {/* Dashboard heading and main action */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

                {/* Dashboard heading */}
                <div>

                    <h1>Overview</h1>

                    <p className="mb-0">
                        Here's what's happening at Sandhu Bakery today.
                    </p>

                </div>

                {/* Opens the Add Product page */}
                <button
                    type="button"
                    className="btn bakery-dashboard-primary-button d-flex align-items-center justify-content-center gap-2"
                    onClick={() => navigate("/bakery/products/new")}
                >
                    <Plus size={18} strokeWidth={2} />
                    <span>Add product</span>
                </button>

            </div>

            {/* Dashboard summary cards */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">

                {/* Revenue summary */}
                <DashboardStatCard
                    label="Revenue"
                    value="$0.00"
                    note="This week"
                    icon={<DollarSign size={19} strokeWidth={1.8} />}
                />

                {/* Orders summary */}
                <DashboardStatCard
                    label="Orders"
                    value="0"
                    note="This week"
                    icon={<ShoppingCart size={19} strokeWidth={1.8} />}
                />

                {/* Average order value summary */}
                <DashboardStatCard
                    label="Average order"
                    value="$0.00"
                    note="This week"
                    icon={<ReceiptText size={19} strokeWidth={1.8} />}
                />

                {/* New customers summary */}
                <DashboardStatCard
                    label="New customers"
                    value="0"
                    note="This week"
                    icon={<UserPlus size={19} strokeWidth={1.8} />}
                />

            </div>

            {/* Recent orders section */}
            <div className="card bakery-dashboard-section-card mb-4">

                {/* Recent orders heading */}
                <div className="card-header d-flex align-items-center justify-content-between gap-3">

                    <div>

                        <h2 className="bakery-dashboard-section-title mb-1">
                            Recent orders
                        </h2>

                        <p className="bakery-dashboard-section-description mb-0">
                            Latest customer orders for your bakery.
                        </p>

                    </div>

                    {/* Opens the full orders page */}
                    <button
                        type="button"
                        className="btn bakery-dashboard-text-button"
                    >
                        View all
                    </button>

                </div>

                {/* Allows the order table to scroll on smaller screens */}
                <div className="table-responsive">

                    <table className="table bakery-dashboard-table align-middle mb-0">

                        {/* Order table headings */}
                        <thead>
                            <tr>
                                <th scope="col">Order</th>
                                <th scope="col">Customer</th>
                                <th scope="col">Items</th>
                                <th scope="col">Total</th>
                                <th scope="col">Status</th>
                                <th scope="col" className="text-end">Action</th>
                            </tr>
                        </thead>

                        {/* Recent order records */}
                        <tbody>

                            {/* Preparing order */}
                            <tr>

                                <td>
                                    <strong>#1001</strong>
                                </td>

                                <td>Olivia Chen</td>

                                <td>Custom Cake</td>

                                <td>$58.00</td>

                                <td>
                                    <span className="badge bakery-order-status bakery-order-status-preparing">
                                        Preparing
                                    </span>
                                </td>

                                <td className="text-end">

                                    <button
                                        type="button"
                                        className="btn bakery-dashboard-table-action"
                                    >
                                        View
                                    </button>

                                </td>

                            </tr>

                            {/* Ready order */}
                            <tr>

                                <td>
                                    <strong>#1002</strong>
                                </td>

                                <td>Priya Nair</td>

                                <td>Cupcakes</td>

                                <td>$36.00</td>

                                <td>
                                    <span className="badge bakery-order-status bakery-order-status-ready">
                                        Ready
                                    </span>
                                </td>

                                <td className="text-end">

                                    <button
                                        type="button"
                                        className="btn bakery-dashboard-table-action"
                                    >
                                        View
                                    </button>

                                </td>

                            </tr>

                            {/* Completed order */}
                            <tr>

                                <td>
                                    <strong>#1003</strong>
                                </td>

                                <td>Daniel Ortiz</td>

                                <td>Cookie Box</td>

                                <td>$24.00</td>

                                <td>
                                    <span className="badge bakery-order-status bakery-order-status-completed">
                                        Completed
                                    </span>
                                </td>

                                <td className="text-end">

                                    <button
                                        type="button"
                                        className="btn bakery-dashboard-table-action"
                                    >
                                        View
                                    </button>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}