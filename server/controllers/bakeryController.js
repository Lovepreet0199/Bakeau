//Import the Bakery model to create and manage bakery records
import Bakery from "../models/Bakery.js";

//Import the Product model to retrieve products for the public bakery storefront
import Product from "../models/Product.js";

//Import the Customization Group model to retrieve product customization groups
import CustomizationGroup from "../models/CustomizationGroup.js";

//Import the Customization Option model to retrieve options for each customization group
import CustomizationOption from "../models/CustomizationOption.js";

//Import Cloudinary to upload and manage bakery images
import cloudinary from "../config/cloudinary.js";

//Import Bakery approval request email helper
import {
    sendBakeryApprovalRequestEmail
} from "../utils/email.js";

//Creates an optimized Cloudinary delivery URL
const createCloudinaryImageUrl = (
    publicId,
    version,
    imageType
) => {

    //Use smaller dimensions for Bakery logos
    if (imageType === "logo") {

        return cloudinary.url(
            publicId,
            {
                secure: true,
                version: version,
                width: 600,
                height: 600,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto"
            }
        );
    }


    //Use larger dimensions for Bakery storefront images
    return cloudinary.url(
        publicId,
        {
            secure: true,
            version: version,
            width: 1600,
            height: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto"
        }
    );
};

//Rounds money values to two decimal places
const roundMoney = (amount) => {

    return Math.round(
        (Number(amount) + Number.EPSILON) * 100
    ) / 100;
};

//Create a bakery for the authenticated Bakery Owner
const createBakery = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Check if the Bakery Owner already has a bakery
        const existingBakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Prevent a Bakery Owner from creating more than one bakery
        if (existingBakery) {
            return response.status(400).json({
                message: "You already have a bakery"
            });
        }

        //Get the bakery information submitted by the Bakery Owner
        const {
            name,
            contact_email,
            contact_phone,
            description,
            pickup_instructions,
            address,
            storefront_theme,
            primary_color,
            secondary_color,
            dark_color,
            logo_image_url,
            logo_image_public_id,
            bakery_image_url,
            bakery_image_public_id,
            minimum_order_notice,
            timezone,
            currency,
            maximum_orders_per_day,
            accepting_orders,
            payment_rule,
            deposit_percentage,
            allow_manual_payment,
            allow_stripe_payment
        } = request.body;

        //Create a URL-friendly slug from the bakery name
        const baseSlug = name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

        //Start with the bakery name as the preferred slug
        let slug = baseSlug;

        //Start the number used if the the preferred slug is already taken
        let slugNumber = 2;

        //Check for duplicate slugs and add a number until a unique slug is found
        while (await Bakery.findOne({ slug: slug })) {

            //Add the next available number to the slug
            slug = `${baseSlug}-${slugNumber}`;

            //Increase the number in case this slug is also taken
            slugNumber++;
        }

        //Create the bakery and connect it to the authenticated Bakery Owner
        const newBakery = await Bakery.create({
            owner_id: ownerId,
            name: name,
            slug: slug,
            contact_email: contact_email,
            contact_phone: contact_phone,
            description: description,
            pickup_instructions: pickup_instructions,
            address: address,
            storefront_theme: storefront_theme,
            primary_color: primary_color,
            secondary_color: secondary_color,
            dark_color: dark_color,
            logo_image_url: logo_image_url,
            logo_image_public_id: logo_image_public_id,
            bakery_image_url: bakery_image_url,
            bakery_image_public_id: bakery_image_public_id,
            minimum_order_notice: minimum_order_notice,
            timezone: timezone,
            currency: currency,
            maximum_orders_per_day: maximum_orders_per_day,
            accepting_orders: accepting_orders,
            payment_rule: payment_rule,
            deposit_percentage: deposit_percentage,
            allow_manual_payment: allow_manual_payment,
            allow_stripe_payment: allow_stripe_payment
        });

        //Return the newly created bakery
        return response.status(201).json({
            message: "Bakery created successfully",
            bakery: newBakery
        });

    } catch (error) {
        console.error("Bakery creation error: ", error.message);

        return response.status(500).json({
            message: "Unable to create bakery"
        });
    }
};

//Marks the Bakery Owner setup process as completed
const completeBakerySetup = async (
    request,
    response
) => {

    try {

        //Get the authenticated Bakery Owner ID
        const ownerId =
            request.user.userId;


        //Find the Bakery owned by this Bakery Owner
        const bakery =
            await Bakery.findOne({
                owner_id:
                    ownerId
            });


        //Stop if the Bakery Owner does not have a Bakery
        if (!bakery) {

            return response
                .status(404)
                .json({

                    message:
                        "Bakery not found"
                });
        }


        //Remember whether setup was already completed
        const wasAlreadyCompleted =
            bakery.setup_completed;


        //Mark the Bakery setup process as completed
        bakery.setup_completed =
            true;


        //Save the updated Bakery
        await bakery.save();


        //Notify Platform Admin only the first time setup is completed
        if (!wasAlreadyCompleted) {

            try {

                await sendBakeryApprovalRequestEmail(
                    bakery
                );

            } catch (emailError) {

                /*
                    Do not fail Bakery setup
                    if the Admin email fails.
                */
                console.error(
                    "Bakery approval request email error:",
                    emailError.message
                );
            }
        }


        //Return completed Bakery
        return response
            .status(200)
            .json({

                message:
                    "Bakery setup completed successfully",

                bakery:
                    bakery
            });


    } catch (error) {

        console.error(
            "Bakery setup completion error:",
            error.message
        );


        return response
            .status(500)
            .json({

                message:
                    "Unable to complete bakery setup"
            });
    }
};

//Get the authenticated Bakery Owner's bakery
const getMyBakery = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Check if the Bakery Owner has created a bakery
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Return the Bakery Owner's bakery
        return response.status(200).json({
            message: "Bakery retrieved successfully",
            bakery: bakery
        });

    } catch (error) {
        console.error("Get bakery error: ", error.message);

        return response.status(500).json({
            message: "Unable to get bakery"
        });
    }
};

//Update the authenticated Bakery Owner's bakery
const updateMyBakery = async (request, response) => {
    try {

        //Get the authenticated Bakery Owner's user ID from the verified JWT
        const ownerId = request.user.userId;

        //Get the bakery information that the Bakery Owner is allowed to update
        const {
            name,
            contact_email,
            contact_phone,
            description,
            pickup_instructions,
            cancellation_policy,
            custom_order_policy,
            additional_policy_information,
            address,
            storefront_theme,
            primary_color,
            secondary_color,
            dark_color,
            logo_image_url,
            logo_image_public_id,
            bakery_image_url,
            bakery_image_public_id,
            minimum_order_notice,
            timezone,
            currency,
            maximum_orders_per_day,
            accepting_orders,
            payment_rule,
            deposit_percentage,
            allow_manual_payment,
            allow_stripe_payment
        } = request.body;

        //Find the bakery that belongs to the authenticated Bakery Owner
        const bakery = await Bakery.findOne({
            owner_id: ownerId
        });

        //Check if the Bakery Owner has a bakery to update
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Update the bakery information
        bakery.name = name;
        bakery.contact_email = contact_email;
        bakery.contact_phone = contact_phone;
        bakery.description = description;
        bakery.pickup_instructions = pickup_instructions;
        bakery.cancellation_policy = cancellation_policy;
        bakery.custom_order_policy = custom_order_policy;
        bakery.additional_policy_information = additional_policy_information;
        bakery.address = address;
        bakery.storefront_theme = storefront_theme;
        bakery.primary_color = primary_color;
        bakery.secondary_color = secondary_color;
        bakery.dark_color = dark_color;
        bakery.logo_image_url = logo_image_url;
        bakery.logo_image_public_id = logo_image_public_id;
        bakery.bakery_image_url = bakery_image_url;
        bakery.bakery_image_public_id = bakery_image_public_id;
        bakery.minimum_order_notice = minimum_order_notice;
        bakery.timezone = timezone;
        //Update the bakery currency only if it was included in the request
        if (currency !== undefined) {
            bakery.currency = currency;
        }
        bakery.maximum_orders_per_day = maximum_orders_per_day;
        bakery.accepting_orders = accepting_orders;
        bakery.payment_rule = payment_rule;
        bakery.deposit_percentage = deposit_percentage;
        bakery.allow_manual_payment = allow_manual_payment;
        //Update Stripe Payment preference only when it was included
        if (allow_stripe_payment !== undefined) {
            bakery.allow_stripe_payment =
                allow_stripe_payment;
        }

        //Save the updated bakery information to the database
        await bakery.save();

        //Return the updated bakery
        return response.status(200).json({
            message: "Bakery updated successfully",
            bakery: bakery
        });

    } catch (error) {
        console.error("Bakery update error: ", error.message);

        return response.status(500).json({
            message: "Unable to update bakery"
        });
    }
};

//Upload a logo for the authenticated Bakery Owner's bakery
const uploadBakeryLogo = async (
    request,
    response
) => {

    try {

        //Check if the Bakery Owner selected an image
        if (!request.file) {

            return response.status(400).json({
                message:
                    "Please select a logo image"
            });
        }


        //Upload the original Bakery logo to Cloudinary
        const uploadResult =
            await new Promise(
                (resolve, reject) => {

                    const uploadStream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder:
                                    "bakeau/bakery-logos",

                                resource_type:
                                    "image"
                            },
                            (
                                error,
                                result
                            ) => {

                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );


                    uploadStream.end(
                        request.file.buffer
                    );
                }
            );


        //Create an optimized delivery URL
        const logoImageUrl =
            createCloudinaryImageUrl(
                uploadResult.public_id,
                uploadResult.version,
                "logo"
            );


        //Return the uploaded logo information
        return response.status(200).json({

            message:
                "Bakery logo uploaded successfully",

            logo_image_url:
                logoImageUrl,

            logo_image_public_id:
                uploadResult.public_id
        });


    } catch (error) {

        console.error(
            "Bakery logo upload error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to upload bakery logo"
        });
    }
};

//Update payment settings for the authenticated Bakery Owner
const updateBakeryPaymentSettings = async (request, response) => {

    try {

        //Get the authenticated Bakery Owner's user ID
        const ownerId =
            request.user.userId;


        //Get the Payment Settings submitted by the Bakery Owner
        const {
            payment_rule,
            deposit_percentage,
            allow_manual_payment,
            allow_stripe_payment
        } = request.body;


        //Find the Bakery belonging to this Owner
        const bakery =
            await Bakery.findOne({
                owner_id:
                    ownerId
            });


        //Stop if Bakery does not exist
        if (!bakery) {

            return response.status(404).json({
                message:
                    "Bakery not found"
            });
        }


        //At least one Payment method must stay enabled
        if (
            !allow_manual_payment &&
            !allow_stripe_payment
        ) {

            return response.status(400).json({
                message:
                    "At least one payment method must be enabled"
            });
        }


        //Stripe cannot be the only method until Stripe is ready
        if (
            !allow_manual_payment &&
            allow_stripe_payment &&
            !bakery.stripe_charges_enabled
        ) {

            return response.status(400).json({
                message:
                    "Complete Stripe setup before using Stripe as your only payment method"
            });
        }


        //Update Payment Settings
        bakery.payment_rule =
            payment_rule;

        bakery.deposit_percentage =
            deposit_percentage;

        bakery.allow_manual_payment =
            allow_manual_payment;

        bakery.allow_stripe_payment =
            allow_stripe_payment;


        //Save updated Bakery
        await bakery.save();


        //Return updated Bakery
        return response.status(200).json({

            message:
                "Payment settings updated successfully",

            bakery:
                bakery
        });


    } catch (error) {

        console.error(
            "Payment settings update error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to update payment settings"
        });
    }
};

//Upload a Bakery image for the Storefront
const uploadBakeryImage = async (
    request,
    response
) => {

    try {

        //Check if the Bakery Owner selected an image
        if (!request.file) {

            return response.status(400).json({
                message:
                    "Please select a bakery image"
            });
        }


        //Upload the original Bakery image to Cloudinary
        const uploadResult =
            await new Promise(
                (resolve, reject) => {

                    const uploadStream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder:
                                    "bakeau/bakery-images",

                                resource_type:
                                    "image"
                            },
                            (
                                error,
                                result
                            ) => {

                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );


                    uploadStream.end(
                        request.file.buffer
                    );
                }
            );


        //Create an optimized delivery URL
        const bakeryImageUrl =
            createCloudinaryImageUrl(
                uploadResult.public_id,
                uploadResult.version,
                "bakery"
            );


        //Return the uploaded Bakery image information
        return response.status(200).json({

            message:
                "Bakery image uploaded successfully",

            bakery_image_url:
                bakeryImageUrl,

            bakery_image_public_id:
                uploadResult.public_id
        });


    } catch (error) {

        console.error(
            "Bakery image upload error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to upload bakery image"
        });
    }
};

//Get a public bakery storefront using its unique slug
const getPublicBakery = async (request, response) => {
    try {
        //Get the bakery slug from the URL
        const slug = request.params.slug;

        //Find an approved bakery that matches the slug from the URL
        const bakery = await Bakery.findOne({
            slug: slug,
            account_status: "Approved"
        }).select("-owner_id -__v");

        //Stop if the bakery does not exist or is not approved
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Return the approved bakery information for the public storefront
        return response.status(200).json({
            bakery: bakery
        });

    } catch (error) {
        console.error("Public bakery retrieval error: ", error.message);

        return response.status(500).json({
            message: "Unable to retrieve bakery"
        });
    }
};

//Calculate a trusted price quote for a public Product
const getPublicBakeryProductQuote = async (request, response) => {

    try {

        //Get the Bakery slug and Product ID from the URL
        const slug = request.params.slug;
        const productId = request.params.productId;

        //Get only Customer selections from the request
        const {
            quantity,
            customization_option_ids = []
        } = request.body;

        //Convert quantity into a number
        const requestedQuantity = Number(quantity);

        //Make sure quantity is valid
        if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
            return response.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        //Make sure customization Options were sent as an array
        if (!Array.isArray(customization_option_ids)) {
            return response.status(400).json({
                message: "Customization options must be an array"
            });
        }

        //Find the approved Bakery
        const bakery = await Bakery.findOne({
            slug: slug,
            account_status: "Approved"
        });

        //Stop if the Bakery does not exist
        if (!bakery) {

            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the public Product and make sure it belongs to this Bakery
        const product = await Product.findOne({
            _id: productId,
            bakery_id: bakery._id,
            is_visible: true,
            is_available: true
        });


        //Stop if the Product does not exist
        if (!product) {

            return response.status(404).json({
                message: "Product not found"
            });
        }

        //Check inventory when this Product tracks stock
        if (product.stock_type === "track_inventory" && Number(product.inventory_quantity) < requestedQuantity) {
            return response.status(400).json({
                message: `Only ${product.inventory_quantity} ${product.name} available`
            });
        }

        //Fund all customization Groups for this Product
        const customizationGroups = await CustomizationGroup.find({
            product_id: product._id
        });

        //Stores selected Options from MongoDB
        let selectedOptions = [];

        //Load selected customization Options
        if (customization_option_ids.length > 0) {

            //Get all Group IDs belonging to this Product
            const groupIds = customizationGroups.map((group) => group._id);


            //Find only Options belonging to this Product
            selectedOptions =
                await CustomizationOption.find({
                    _id: {
                        $in: customization_option_ids
                    },
                    group_id: {
                        $in: groupIds
                    }
                });


            //Make sure every submitted Option was valid
            if (
                selectedOptions.length !==
                customization_option_ids.length
            ) {

                return response.status(400).json({
                    message:
                        "One or more customization options are invalid"
                });
            }
        }


        //Tracks which Groups already have a selected Option
        const selectedGroupIds = new Set();


        //Stores the trusted customization price breakdown
        const customizationBreakdown = [];


        //Tracks customization pricing
        let customizationTotal = 0;


        //Validate each selected Option
        for (const option of selectedOptions) {

            //Find the Group this Option belongs to
            const group = customizationGroups.find(
                (currentGroup) =>
                    currentGroup._id.toString() ===
                    option.group_id.toString()
            );


            //Stop if the Group cannot be found
            if (!group) {

                return response.status(400).json({
                    message: "Invalid customization group"
                });
            }


            //Only allow one Option from each Group
            if (
                selectedGroupIds.has(
                    group._id.toString()
                )
            ) {

                return response.status(400).json({
                    message:
                        `Only one option can be selected from ${group.name}`
                });
            }


            //Remember this Group already has a selected Option
            selectedGroupIds.add(
                group._id.toString()
            );


            //Use the trusted Option price stored in MongoDB
            const optionPrice =
                roundMoney(option.additional_price);


            //Add Option price to customization total
            customizationTotal +=
                optionPrice;


            //Add trusted Option information to the breakdown
            customizationBreakdown.push({

                group_id:
                    group._id,

                group_name:
                    group.name,

                option_id:
                    option._id,

                option_name:
                    option.name,

                additional_price:
                    optionPrice
            });
        }


        //Make sure every required Group has a selection
        for (const group of customizationGroups) {

            if (
                group.is_required &&
                !selectedGroupIds.has(
                    group._id.toString()
                )
            ) {

                return response.status(400).json({
                    message:
                        `${group.name} is required`
                });
            }
        }


        //Get the trusted Product base price from MongoDB
        const basePrice =
            roundMoney(product.base_price);


        //Round the customization total
        customizationTotal =
            roundMoney(customizationTotal);


        //Calculate one configured Product price
        const unitPrice =
            roundMoney(
                basePrice +
                customizationTotal
            );


        //Calculate the full price using quantity
        const itemTotal =
            roundMoney(
                unitPrice *
                requestedQuantity
            );


        //Full amount is due by default
        let amountDueNow =
            itemTotal;


        //Use the Product payment rule
        const paymentRule =
            product.payment_rule;


        //Get the Product deposit percentage
        const depositPercentage =
            Number(
                product.deposit_percentage || 0
            );


        //Calculate deposit when this Product requires one
        if (
            paymentRule === "deposit" &&
            depositPercentage > 0
        ) {

            amountDueNow =
                roundMoney(
                    itemTotal *
                    (
                        depositPercentage /
                        100
                    )
                );
        }


        //Return trusted backend-calculated pricing
        return response.status(200).json({

            quote: {

                product_id:
                    product._id,

                product_name:
                    product.name,

                base_price:
                    basePrice,

                customizations:
                    customizationBreakdown,

                customization_total:
                    customizationTotal,

                unit_price:
                    unitPrice,

                quantity:
                    requestedQuantity,

                item_total:
                    itemTotal,

                payment_rule:
                    paymentRule,

                deposit_percentage:
                    paymentRule === "deposit"
                        ? depositPercentage
                        : null,

                amount_due_now:
                    amountDueNow
            }
        });


    } catch (error) {

        //Log Product quote errors
        console.error(
            "Public Product quote error:",
            error.message
        );


        //Return server error
        return response.status(500).json({
            message:
                "Unable to calculate product price"
        });
    }
};

//Calculates a trusted price quote for all Products inside a public Cart
const getPublicBakeryCartQuote = async (request, response) => {

    try {

        //Get the Bakery slug from the URL
        const slug =
            request.params.slug;


        //Get the Cart items sent by the Customer
        const {
            items
        } = request.body;


        //Make sure the Cart contains at least one Product
        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return response.status(400).json({
                message:
                    "Cart must contain at least one product"
            });
        }


        //Find the approved Bakery
        const bakery =
            await Bakery.findOne({
                slug: slug,
                account_status: "Approved"
            });


        //Stop if the Bakery cannot be found
        if (!bakery) {

            return response.status(404).json({
                message:
                    "Bakery not found"
            });
        }


        //Stores trusted Cart item quotes
        const quotedItems = [];


        //Tracks the full Cart price
        let cartSubtotal = 0;


        //Tracks how much the Customer must pay now
        let cartAmountDueNow = 0;

        //Start with the Bakery minimum Order notice
        let requiredNoticeHours =
            Number(
                bakery.minimum_order_notice ||
                0
            );

        //Validate and calculate every Cart Product
        for (const requestedItem of items) {

            //Convert quantity into a number
            const quantity =
                Number(
                    requestedItem.quantity
                );


            //Make sure quantity is valid
            if (
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {

                return response.status(400).json({
                    message:
                        "Product quantity must be at least 1"
                });
            }


            //Get selected customization Option IDs
            const selectedOptionIds =
                requestedItem.customization_option_ids ||
                [];


            //Make sure customization Options are an array
            if (
                !Array.isArray(
                    selectedOptionIds
                )
            ) {

                return response.status(400).json({
                    message:
                        "Customization options must be an array"
                });
            }


            //Find the public Product inside this Bakery
            const product =
                await Product.findOne({
                    _id:
                        requestedItem.product_id,

                    bakery_id:
                        bakery._id,

                    is_visible:
                        true,

                    is_available:
                        true
                });

            //Stop if the Product cannot be ordered
            if (!product) {

                return response.status(404).json({
                    message:
                        "One or more Cart products could not be found"
                });
            }


            //Use the largest Product preparation notice in the Cart
            requiredNoticeHours =
                Math.max(
                    requiredNoticeHours,
                    Number(
                        product.minimum_preparation_notice ||
                        0
                    )
                );


            //Check inventory when this Product tracks stock
            if (
                product.stock_type ===
                "track_inventory" &&
                Number(
                    product.inventory_quantity
                ) < quantity
            ) {

                return response.status(400).json({
                    message:
                        `Only ${product.inventory_quantity} ${product.name} available`
                });
            }


            //Find customization Groups for this Product
            const customizationGroups =
                await CustomizationGroup.find({
                    product_id:
                        product._id
                });


            //Stores selected Options from MongoDB
            let selectedOptions = [];


            //Load selected Options when some were submitted
            if (
                selectedOptionIds.length >
                0
            ) {

                //Get Group IDs belonging to this Product
                const groupIds =
                    customizationGroups.map(
                        (group) =>
                            group._id
                    );


                //Find only Options belonging to this Product
                selectedOptions =
                    await CustomizationOption.find({
                        _id: {
                            $in:
                                selectedOptionIds
                        },

                        group_id: {
                            $in:
                                groupIds
                        }
                    });


                //Make sure every selected Option was valid
                if (
                    selectedOptions.length !==
                    selectedOptionIds.length
                ) {

                    return response.status(400).json({
                        message:
                            `Invalid customization selected for ${product.name}`
                    });
                }
            }


            //Tracks which Groups already have a selection
            const selectedGroupIds =
                new Set();


            //Stores trusted customization details
            const customizationBreakdown =
                [];


            //Tracks customization pricing
            let customizationTotal =
                0;


            //Validate each selected Option
            for (
                const option
                of selectedOptions
            ) {

                //Find the Group this Option belongs to
                const group =
                    customizationGroups.find(
                        (currentGroup) =>
                            currentGroup._id.toString() ===
                            option.group_id.toString()
                    );


                //Stop if the Group cannot be found
                if (!group) {

                    return response.status(400).json({
                        message:
                            "Invalid customization group"
                    });
                }


                //Only allow one Option from each Group
                if (
                    selectedGroupIds.has(
                        group._id.toString()
                    )
                ) {

                    return response.status(400).json({
                        message:
                            `Only one option can be selected from ${group.name}`
                    });
                }


                //Remember this Group already has a selection
                selectedGroupIds.add(
                    group._id.toString()
                );


                //Get trusted Option price
                const optionPrice =
                    roundMoney(
                        option.additional_price
                    );


                //Add Option price to customization total
                customizationTotal +=
                    optionPrice;


                //Save trusted customization information
                customizationBreakdown.push({

                    group_id:
                        group._id,

                    group_name:
                        group.name,

                    option_id:
                        option._id,

                    option_name:
                        option.name,

                    additional_price:
                        optionPrice
                });
            }


            //Make sure required Groups have a selected Option
            for (
                const group
                of customizationGroups
            ) {

                if (
                    group.is_required &&
                    !selectedGroupIds.has(
                        group._id.toString()
                    )
                ) {

                    return response.status(400).json({
                        message:
                            `${group.name} is required for ${product.name}`
                    });
                }
            }


            //Get the trusted Product base price
            const basePrice =
                roundMoney(
                    product.base_price
                );


            //Round customization pricing
            customizationTotal =
                roundMoney(
                    customizationTotal
                );


            //Calculate one configured Product price
            const unitPrice =
                roundMoney(
                    basePrice +
                    customizationTotal
                );


            //Calculate this Cart item's total
            const itemTotal =
                roundMoney(
                    unitPrice *
                    quantity
                );


            //Full amount is due by default
            let itemAmountDueNow =
                itemTotal;


            //Get this Product's payment settings
            const paymentRule =
                product.payment_rule;


            const depositPercentage =
                Number(
                    product.deposit_percentage ||
                    0
                );


            //Calculate deposit when this Product requires one
            if (
                paymentRule ===
                "deposit" &&
                depositPercentage > 0
            ) {

                itemAmountDueNow =
                    roundMoney(
                        itemTotal *
                        (
                            depositPercentage /
                            100
                        )
                    );
            }


            //Add this Product to the Cart subtotal
            cartSubtotal +=
                itemTotal;


            //Add the amount due now
            cartAmountDueNow +=
                itemAmountDueNow;


            //Save the trusted Product quote
            quotedItems.push({

                product_id:
                    product._id,

                product_name:
                    product.name,

                base_price:
                    basePrice,

                customizations:
                    customizationBreakdown,

                customization_total:
                    customizationTotal,

                unit_price:
                    unitPrice,

                quantity:
                    quantity,

                item_total:
                    itemTotal,

                payment_rule:
                    paymentRule,

                deposit_percentage:
                    paymentRule ===
                        "deposit"
                        ? depositPercentage
                        : null,

                amount_due_now:
                    itemAmountDueNow
            });
        }


        //Round final Cart totals
        cartSubtotal =
            roundMoney(
                cartSubtotal
            );


        cartAmountDueNow =
            roundMoney(
                cartAmountDueNow
            );


        //Check if any part of the Order uses a deposit
        const depositRequired =
            cartAmountDueNow <
            cartSubtotal;


        //Return the trusted Cart quote
        return response.status(200).json({

            quote: {

                items:
                    quotedItems,

                subtotal:
                    cartSubtotal,

                total:
                    cartSubtotal,

                deposit_required:
                    depositRequired,

                amount_due_now:
                    cartAmountDueNow,

                currency:
                    bakery.currency,

                //Largest notice required for this Cart
                required_notice_hours:
                    requiredNoticeHours
            }
        });


    } catch (error) {

        //Log Cart quote errors
        console.error(
            "Public Cart quote error:",
            error.message
        );


        //Return server error
        return response.status(500).json({
            message:
                "Unable to calculate Cart price"
        });
    }
};

//Get the public products for a bakery using its unique slug
const getPublicBakeryProducts = async (request, response) => {
    try {
        //Get the bakery slug from the URL
        const slug = request.params.slug;

        //Find the approved bakery that matches the slug from the URL
        const bakery = await Bakery.findOne({
            slug: slug,
            account_status: "Approved"
        });

        //Stop if the bakery does not exist or is not approved
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the public products that belong to this bakery
        const products = await Product.find({
            bakery_id: bakery._id,
            is_visible: true,
            is_available: true
        }).select("-image_public_id -__v");

        //Return the bakery's public products
        return response.status(200).json({
            products: products
        });

    } catch (error) {
        console.error("Public bakery products retrieval error: ", error.message);

        return response.status(500).json({
            message: "Unable to retrieve bakery products"
        });
    }
};

//Get a public product and its customization details for a specific bakery
const getPublicBakeryProduct = async (request, response) => {
    try {
        //Get the bakery slug and product ID from the URL
        const slug = request.params.slug;
        const productId = request.params.productId;

        //Find the approved bakery that matches the slug from the URL
        const bakery = await Bakery.findOne({
            slug: slug,
            account_status: "Approved"
        });

        //Stop if the bakery does not exist or is not approved
        if (!bakery) {
            return response.status(404).json({
                message: "Bakery not found"
            });
        }

        //Find the public product and make sure it belongs to this bakery
        const product = await Product.findOne({
            _id: productId,
            bakery_id: bakery._id,
            is_visible: true,
            is_available: true
        }).select("-image_public_id -__v");

        //Stop if the product does not exist or does not belong to this bakery
        if (!product) {
            return response.status(404).json({
                message: "Product not found"
            });
        }

        //Find all customization groups that belong to this product
        const customizationGroups = await CustomizationGroup.find({
            product_id: product._id
        }).select("-__v");

        //Create an array to store each customization group together with its options
        const customizationDetails = [];

        //Loop through each customization group to find its options
        for (const customizationGroup of customizationGroups) {

            //Find all customization options that belong to the current group
            const customizationOptions = await CustomizationOption.find({
                group_id: customizationGroup._id
            }).select("-__v");

            //Add the customization group and its options to the customization details array
            customizationDetails.push({
                group: customizationGroup,
                options: customizationOptions
            });
        }

        //Return the public product together with its customization groups and options
        return response.status(200).json({
            product: product,
            customizationDetails: customizationDetails
        });

    } catch (error) {
        console.error("Public product retrieval error: ", error.message);

        return response.status(500).json({
            message: "Unable to retrieve product"
        });
    }
};

//Export bakery controller functions so they can be used in the routes
export {
    createBakery,
    completeBakerySetup,
    getMyBakery,
    updateMyBakery,
    updateBakeryPaymentSettings,
    uploadBakeryLogo,
    uploadBakeryImage,
    getPublicBakery,
    getPublicBakeryProducts,
    getPublicBakeryProduct,
    getPublicBakeryProductQuote,
    getPublicBakeryCartQuote
};