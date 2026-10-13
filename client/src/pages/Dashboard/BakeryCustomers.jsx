//Import React hooks
import { useEffect, useState } from "react";

//Import authentication helper
import { getAuthToken } from "../../utils/authStorage.js";

//Import Customer page icons
import {
    LoaderCircle,
    Mail,
    Phone,
    Search,
    UserRound
} from "lucide-react";

//Import Customer page styles
import "./styles/Customers.css";


//Displays all Customers who have ordered from this Bakery
export default function BakeryCustomers() {

    //Stores Bakery Customers
    const [customers, setCustomers] = useState([]);

    //Tracks whether Customers are loading
    const [isLoading, setIsLoading] = useState(true);

    //Stores Customer loading errors
    const [error, setError] = useState("");

    //Stores Customer search text
    const [searchTerm, setSearchTerm] = useState("");


    //Loads Bakery Customers when the page opens
    useEffect(() => {

        async function fetchCustomers() {

            setIsLoading(true);
            setError("");

            try {

                //Get Bakery Owner token
                const token = getAuthToken();


                //Request Customers belonging to this Bakery
                const response = await fetch(
                    "http://localhost:3000/api/customers/bakery",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                //Convert response into JavaScript data
                const data = await response.json();


                //Stop if Customers could not be loaded
                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to load customers"
                    );
                }


                //Store Bakery Customers
                setCustomers(
                    data.customers || []
                );


            } catch (error) {

                setError(
                    error.message
                );

            } finally {

                setIsLoading(false);
            }
        }


        fetchCustomers();

    }, []);


    //Formats money values
    function formatPrice(amount) {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",
                currency: "CAD"
            }
        ).format(
            Number(amount) || 0
        );
    }


    //Formats the Customer's latest Order date
    function formatDate(date) {

        if (!date) {
            return "—";
        }


        return new Date(
            date
        ).toLocaleDateString(
            "en-CA",
            {
                month: "short",
                day: "numeric",
                year: "numeric"
            }
        );
    }


    //Filters Customers using their name, email, or phone number
    const filteredCustomers = customers.filter((customer) => {

        //Clean the Search value
        const searchValue =
            searchTerm
                .trim()
                .toLowerCase();


        //Show all Customers when Search is empty
        if (!searchValue) {
            return true;
        }


        //Create one searchable Customer value
        const searchableCustomer = [
            customer.first_name,
            customer.last_name,
            customer.email,
            customer.phone_number
        ]
            .map((value) =>
                String(value || "").toLowerCase()
            )
            .join(" ");


        //Check whether Customer matches Search
        return searchableCustomer.includes(
            searchValue
        );
    });


    return (

        <div className="bakery-customers-page">


            {/* Customers page heading */}
            <div className="mb-4">

                <h1 className="mb-1">
                    Customers
                </h1>

                <p className="mb-0 bakery-customers-description">
                    View Customers who have ordered from your Bakery.
                </p>

            </div>


            {/* Customer search */}
            <div className="row g-2 align-items-center mb-3">

                <div className="col-12 col-md-5">

                    <div className="bakery-customers-search">

                        <Search
                            size={16}
                            strokeWidth={1.8}
                            className="bakery-customers-search-icon"
                        />

                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>

            </div>


            {/* Customer count */}
            {!isLoading && !error && (

                <p className="bakery-customers-count">

                    {filteredCustomers.length}{" "}

                    {filteredCustomers.length === 1
                        ? "customer"
                        : "customers"
                    }

                </p>

            )}


            {/* Loading state */}
            {isLoading && (

                <div className="bakery-customers-loading">

                    <LoaderCircle
                        size={26}
                        strokeWidth={1.8}
                        className="bakery-customers-loading-icon"
                    />

                    <div>

                        <strong>
                            Loading customers
                        </strong>

                        <span>
                            Getting your Bakery Customers...
                        </span>

                    </div>

                </div>

            )}


            {/* Error state */}
            {!isLoading && error && (

                <p className="bakery-customers-error">
                    {error}
                </p>

            )}


            {/* No Customers yet */}
            {!isLoading &&
                !error &&
                customers.length === 0 && (

                    <div className="bakery-customers-empty-state">

                        <div className="bakery-customers-empty-icon">

                            <UserRound
                                size={22}
                                strokeWidth={1.8}
                            />

                        </div>

                        <h2>
                            No customers yet
                        </h2>

                        <p className="mb-0">
                            Customers will appear here after they place an Order.
                        </p>

                    </div>

                )}


            {/* No Customers match search */}
            {!isLoading &&
                !error &&
                customers.length > 0 &&
                filteredCustomers.length === 0 && (

                    <div className="bakery-customers-empty-state">

                        <h2>
                            No customers found
                        </h2>

                        <p className="mb-0">
                            Try searching by name, email, or phone number.
                        </p>

                    </div>

                )}


            {/* Customers table */}
            {!isLoading &&
                !error &&
                filteredCustomers.length > 0 && (

                    <div className="bakery-dashboard-section-card overflow-hidden">

                        <div className="table-responsive">

                            <table className="table mb-0 bakery-dashboard-table bakery-customers-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Contact
                                        </th>

                                        <th>
                                            Orders
                                        </th>

                                        <th>
                                            Total spent
                                        </th>

                                        <th>
                                            Last order
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredCustomers.map(
                                        (customer) => (

                                            <tr key={customer._id}>


                                                {/* Customer */}
                                                <td>

                                                    <div className="bakery-customers-customer">

                                                        <div className="bakery-customers-avatar">

                                                            {customer.first_name
                                                                ?.charAt(0)
                                                                .toUpperCase()}

                                                            {customer.last_name
                                                                ?.charAt(0)
                                                                .toUpperCase()}

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {customer.first_name}{" "}
                                                                {customer.last_name}
                                                            </strong>

                                                            <span>
                                                                Customer
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* Contact */}
                                                <td>

                                                    <div className="bakery-customers-contact">

                                                        {customer.email && (

                                                            <div>

                                                                <Mail
                                                                    size={13}
                                                                    strokeWidth={1.8}
                                                                />

                                                                <span>
                                                                    {customer.email}
                                                                </span>

                                                            </div>

                                                        )}


                                                        {customer.phone_number && (

                                                            <div>

                                                                <Phone
                                                                    size={13}
                                                                    strokeWidth={1.8}
                                                                />

                                                                <span>
                                                                    {customer.phone_number}
                                                                </span>

                                                            </div>

                                                        )}

                                                    </div>

                                                </td>


                                                {/* Order count */}
                                                <td>

                                                    <span className="bakery-customers-order-count">

                                                        {customer.order_count}{" "}

                                                        {customer.order_count === 1
                                                            ? "order"
                                                            : "orders"
                                                        }

                                                    </span>

                                                </td>


                                                {/* Total amount paid */}
                                                <td>

                                                    <strong className="bakery-customers-spent">

                                                        {formatPrice(
                                                            customer.total_spent
                                                        )}

                                                    </strong>

                                                </td>


                                                {/* Latest Order */}
                                                <td>

                                                    <span className="bakery-customers-date">

                                                        {formatDate(
                                                            customer.last_order_date
                                                        )}

                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

        </div>

    );
}