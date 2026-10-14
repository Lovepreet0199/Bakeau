import API_URL from "../../../config/api.js";
//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import Settings icons
import {
    LoaderCircle,
    Store,
    Image,
    BriefcaseBusiness,
    CreditCard,
    ScrollText,
    UserRound
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../../utils/authStorage.js";

//Import Settings components
import GeneralSettings from "./GeneralSettings.jsx";
import StorefrontSettings from "./StorefrontSettings.jsx";
import BusinessSettings from "./BusinessSettings.jsx";
import PaymentSettings from "./PaymentSettings.jsx";
import PolicySettings from "./PolicySettings.jsx";
import AccountSettings from "./AccountSettings.jsx";

//Import Settings styles
import "../styles/Settings.css";


//Gets the Bakery Owner's Bakery
async function getMyBakery() {

    const token = getAuthToken();

    const response = await fetch(
        `${API_URL}/api/bakeries/mine`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Unable to load bakery settings"
        );
    }

    return data.bakery || data;
}


//Displays Bakery Owner settings
export default function BakerySettings() {

    //Stores the Bakery returned by the backend
    const [bakery, setBakery] = useState(null);

    //Tracks the selected Settings tab
    const [activeTab, setActiveTab] = useState("general");

    //Tracks whether Settings are loading
    const [isLoading, setIsLoading] = useState(true);

    //Stores Settings loading errors
    const [error, setError] = useState("");


    //Load Bakery settings when the page opens
    useEffect(() => {

        let isCancelled = false;

        async function loadBakery() {

            try {

                const bakeryData =
                    await getMyBakery();

                if (!isCancelled) {

                    setBakery(bakeryData);
                    setError("");
                }

            } catch (error) {

                if (!isCancelled) {
                    setError(error.message);
                }

            } finally {

                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadBakery();


        //Stops state updates if the page closes early
        return () => {
            isCancelled = true;
        };

    }, []);


    return (
        <div className="bakery-settings-page">

            {/* Settings heading */}
            <div className="bakery-settings-heading">

                <h1>
                    Settings
                </h1>

                <p>
                    Manage your bakery information,
                    storefront, business preferences
                    and policies.
                </p>

            </div>


            {/* Loading state */}
            {isLoading && (

                <div className="bakery-settings-loading">

                    <LoaderCircle
                        size={26}
                        strokeWidth={1.8}
                        className="bakery-settings-spinner"
                    />

                    <div>

                        <strong>
                            Loading settings
                        </strong>

                        <span>
                            Getting your bakery information...
                        </span>

                    </div>

                </div>

            )}


            {/* Loading error */}
            {!isLoading && error && (

                <div className="bakery-settings-error">
                    {error}
                </div>

            )}


            {/* Settings content */}
            {!isLoading &&
                !error &&
                bakery && (

                    <>

                        {/* Settings navigation */}
                        <div className="bakery-settings-tabs">

                            {/* General */}
                            <button
                                type="button"
                                className={
                                    activeTab === "general"
                                        ? "bakery-settings-tab active"
                                        : "bakery-settings-tab"
                                }
                                onClick={() =>
                                    setActiveTab("general")
                                }
                            >
                                <Store
                                    size={16}
                                    strokeWidth={1.8}
                                />

                                General
                            </button>


                            {/* Storefront */}
                            <button
                                type="button"
                                className={
                                    activeTab === "storefront"
                                        ? "bakery-settings-tab active"
                                        : "bakery-settings-tab"
                                }
                                onClick={() =>
                                    setActiveTab("storefront")
                                }
                            >
                                <Image
                                    size={16}
                                    strokeWidth={1.8}
                                />

                                Storefront
                            </button>


                            {/* Business */}
                            <button
                                type="button"
                                className={
                                    activeTab === "business"
                                        ? "bakery-settings-tab active"
                                        : "bakery-settings-tab"
                                }
                                onClick={() =>
                                    setActiveTab("business")
                                }
                            >
                                <BriefcaseBusiness
                                    size={16}
                                    strokeWidth={1.8}
                                />

                                Business
                            </button>


                            {/* Payments */}
                            <button
                                type="button"
                                className={
                                    activeTab === "payments"
                                        ? "bakery-settings-tab active"
                                        : "bakery-settings-tab"
                                }
                                onClick={() =>
                                    setActiveTab("payments")
                                }
                            >
                                <CreditCard
                                    size={16}
                                    strokeWidth={1.8}
                                />

                                Payments
                            </button>


                            {/* Policies */}
                            <button
                                type="button"
                                className={
                                    activeTab === "policies"
                                        ? "bakery-settings-tab active"
                                        : "bakery-settings-tab"
                                }
                                onClick={() =>
                                    setActiveTab("policies")
                                }
                            >
                                <ScrollText
                                    size={16}
                                    strokeWidth={1.8}
                                />

                                Policies
                            </button>

                            {/* Account */}
                            <button
                                type="button"
                                className={
                                    activeTab === "account"
                                        ? "bakery-settings-tab active"
                                        : "bakery-settings-tab"
                                }
                                onClick={() =>
                                    setActiveTab("account")
                                }
                            >
                                <UserRound
                                    size={16}
                                    strokeWidth={1.8}
                                />

                                Account
                            </button>

                        </div>


                        {/* General Settings */}
                        {activeTab === "general" && (

                            <GeneralSettings
                                bakery={bakery}
                                setBakery={setBakery}
                            />

                        )}


                        {/* Storefront Settings */}
                        {activeTab === "storefront" && (

                            <StorefrontSettings
                                bakery={bakery}
                                setBakery={setBakery}
                            />

                        )}


                        {/* Business Settings */}
                        {activeTab === "business" && (

                            <BusinessSettings
                                bakery={bakery}
                                setBakery={setBakery}
                            />

                        )}

                        {/* Payment Settings */}
                        {activeTab === "payments" && (

                            <PaymentSettings
                                bakery={bakery}
                                setBakery={setBakery}
                            />

                        )}


                        {/* Policy Settings */}
                        {activeTab === "policies" && (

                            <PolicySettings
                                bakery={bakery}
                                setBakery={setBakery}
                            />

                        )}

                        {/* Account Settings */}
                        {activeTab === "account" && (

                            <AccountSettings />

                        )}
                    </>

                )
            }

        </div>
    );
}