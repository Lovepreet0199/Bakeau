//Import React hook
import {
    useState
} from "react";

//Import Footer styles
import "./StorefrontFooter.css";


//Displays the shared public Storefront Footer
export default function StorefrontFooter({
    bakery
}) {

    //Stores the Policy currently being displayed
    const [
        selectedPolicy,
        setSelectedPolicy
    ] = useState(null);


    //Do not display Footer until Bakery data exists
    if (!bakery) {
        return null;
    }


    //Opens a Footer Policy
    function openPolicy(
        title
    ) {

        setSelectedPolicy(
            title
        );
    }


    //Closes the Policy modal
    function closePolicy() {

        setSelectedPolicy(
            null
        );
    }


    //Creates the public Pickup address
    const pickupAddress = [
        bakery.address?.street,
        bakery.address?.city,
        bakery.address?.province
    ]
        .filter(Boolean)
        .join(", ");


    return (

        <>

            {/* Shared Storefront Footer */}
            <footer className="storefront-footer py-5">

                <div className="container-xxl px-3">

                    <div className="row g-4">

                        {/* Bakery information */}
                        <div className="col-12 col-md-5">

                            <h3 className="mb-3">
                                {bakery.name}
                            </h3>


                            <p className="mb-0">
                                {bakery.description}
                            </p>

                        </div>


                        {/* Pickup information */}
                        <div className="col-12 col-sm-6 col-md-3">

                            <h4 className="mb-3">
                                Pickup
                            </h4>


                            <p className="mb-0">

                                {bakery.address?.street}

                                {bakery.address?.street && (
                                    <br />
                                )}

                                {bakery.address?.city}

                                {bakery.address?.city &&
                                    bakery.address?.province
                                    ? ", "
                                    : ""
                                }

                                {bakery.address?.province}

                            </p>

                        </div>


                        {/* Contact information */}
                        <div className="col-12 col-sm-6 col-md-4">

                            <h4 className="mb-3">
                                Contact
                            </h4>


                            <p className="mb-2">

                                {bakery.contact_email}


                                {bakery.contact_phone && (

                                    <>

                                        <br />

                                        {
                                            bakery.contact_phone
                                        }

                                    </>

                                )}

                            </p>


                            {/* Bakery Policy links */}
                            <div className="d-flex flex-wrap gap-3">

                                {/* Privacy */}
                                <button
                                    type="button"
                                    className="storefront-footer-link"
                                    onClick={() =>
                                        openPolicy(
                                            "Privacy"
                                        )
                                    }
                                >
                                    Privacy
                                </button>


                                {/* Pickup Policy */}
                                <button
                                    type="button"
                                    className="storefront-footer-link"
                                    onClick={() =>
                                        openPolicy(
                                            "Pickup Policy"
                                        )
                                    }
                                >
                                    Pickup Policy
                                </button>


                                {/* Terms */}
                                <button
                                    type="button"
                                    className="storefront-footer-link"
                                    onClick={() =>
                                        openPolicy(
                                            "Terms"
                                        )
                                    }
                                >
                                    Terms
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </footer>


            {/* Policy Modal */}
            {selectedPolicy && (

                <div
                    className="storefront-policy-modal-backdrop d-flex align-items-center justify-content-center p-3"
                    onClick={
                        closePolicy
                    }
                >

                    <div
                        className="storefront-policy-modal w-100"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="storefront-policy-title"
                        onClick={
                            (event) =>
                                event.stopPropagation()
                        }
                    >

                        {/* Policy Modal heading */}
                        <div className="storefront-policy-modal-header d-flex align-items-start justify-content-between gap-3 p-4">

                            <div>

                                <span className="storefront-policy-label">
                                    {bakery.name}
                                </span>


                                <h2
                                    id="storefront-policy-title"
                                    className="mb-0"
                                >
                                    {selectedPolicy}
                                </h2>

                            </div>


                            {/* Close Modal button */}
                            <button
                                type="button"
                                className="storefront-policy-close d-flex align-items-center justify-content-center"
                                aria-label="Close policy"
                                onClick={
                                    closePolicy
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* Privacy Policy */}
                        {selectedPolicy ===
                            "Privacy" && (

                                <div className="storefront-policy-content p-4">

                                    {bakery.additional_policy_information ? (

                                        <p className="mb-0">

                                            {
                                                bakery.additional_policy_information
                                            }

                                        </p>

                                    ) : (

                                        <p className="storefront-policy-empty mb-0">

                                            No additional privacy information has been provided by this bakery.

                                        </p>

                                    )}

                                </div>

                            )}


                        {/* Pickup Policy */}
                        {selectedPolicy ===
                            "Pickup Policy" && (

                                <div className="storefront-policy-content p-4">

                                    {bakery.pickup_instructions ? (

                                        <p className="mb-0">

                                            {
                                                bakery.pickup_instructions
                                            }

                                        </p>

                                    ) : (

                                        <p className="storefront-policy-empty mb-0">

                                            No special pickup instructions have been provided.

                                        </p>

                                    )}


                                    {/* Pickup location */}
                                    {pickupAddress && (

                                        <div className="storefront-policy-detail d-flex flex-column gap-1 mt-4 pt-3">

                                            <strong>
                                                Pickup location
                                            </strong>

                                            <span>
                                                {pickupAddress}
                                            </span>

                                        </div>

                                    )}


                                    {/* Minimum order notice */}
                                    {bakery.minimum_order_notice && (

                                        <div className="storefront-policy-detail d-flex flex-column gap-1 mt-4 pt-3">

                                            <strong>
                                                Minimum notice
                                            </strong>

                                            <span>

                                                {
                                                    bakery.minimum_order_notice
                                                }{" "}
                                                hours

                                            </span>

                                        </div>

                                    )}

                                </div>

                            )}


                        {/* Terms */}
                        {selectedPolicy ===
                            "Terms" && (

                                <div className="storefront-policy-content p-4">

                                    {/* Cancellation Policy */}
                                    <div className="storefront-policy-section">

                                        <h3 className="mb-2">
                                            Cancellation policy
                                        </h3>


                                        {bakery.cancellation_policy ? (

                                            <p className="mb-0">

                                                {
                                                    bakery.cancellation_policy
                                                }

                                            </p>

                                        ) : (

                                            <p className="storefront-policy-empty mb-0">

                                                No cancellation policy has been provided.

                                            </p>

                                        )}

                                    </div>


                                    {/* Custom Order Policy */}
                                    <div className="storefront-policy-section mt-4 pt-4">

                                        <h3 className="mb-2">
                                            Custom order policy
                                        </h3>


                                        {bakery.custom_order_policy ? (

                                            <p className="mb-0">

                                                {
                                                    bakery.custom_order_policy
                                                }

                                            </p>

                                        ) : (

                                            <p className="storefront-policy-empty mb-0">

                                                No custom order policy has been provided.

                                            </p>

                                        )}

                                    </div>

                                </div>

                            )}


                        {/* Modal footer */}
                        <div className="d-flex justify-content-end p-4 pt-0">

                            <button
                                type="button"
                                className="storefront-policy-done"
                                onClick={
                                    closePolicy
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}