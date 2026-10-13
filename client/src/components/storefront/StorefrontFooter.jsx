//Import Footer styles
import "./StorefrontFooter.css";


//Displays the shared Storefront Footer
export default function StorefrontFooter({
    bakery
}) {

    //Do not display Footer until Bakery data exists
    if (!bakery) {
        return null;
    }


    return (

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


                    {/* Pickup */}
                    <div className="col-12 col-sm-6 col-md-3">

                        <h4 className="mb-3">
                            Pickup
                        </h4>


                        <p className="mb-0">

                            {bakery.address?.street}

                            <br />

                            {bakery.address?.city}
                            {bakery.address?.city &&
                                bakery.address?.province
                                ? ", "
                                : ""}
                            {bakery.address?.province}

                        </p>

                    </div>


                    {/* Contact */}
                    <div className="col-12 col-sm-6 col-md-4">

                        <h4 className="mb-3">
                            Contact
                        </h4>


                        <p className="mb-2">

                            {bakery.contact_email}


                            {bakery.contact_phone && (
                                <>
                                    <br />

                                    {bakery.contact_phone}
                                </>
                            )}

                        </p>


                        {/* Storefront policy links will be connected later */}
                        <div className="d-flex flex-wrap gap-3">

                            <span className="storefront-footer-link">
                                Privacy
                            </span>

                            <span className="storefront-footer-link">
                                Pickup Policy
                            </span>

                            <span className="storefront-footer-link">
                                Terms
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </footer>
    );
}