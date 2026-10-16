//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import API URL
import API_URL from "../../config/api.js";

//Import authentication helper
import {
    getAuthToken
} from "../../utils/authStorage";

//Import Analytics styles
import "./styles/BakeryAnalytics.css";


//Gets Analytics and Order information from the API
async function fetchAnalyticsData(
    selectedFrom = "",
    selectedTo = ""
) {

    //Get logged-in Bakery Owner token
    const token =
        getAuthToken();


    //Create optional date filter
    const query =
        new URLSearchParams();


    //Add start date when selected
    if (selectedFrom) {

        query.append(
            "from",
            selectedFrom
        );
    }


    //Add end date when selected
    if (selectedTo) {

        query.append(
            "to",
            selectedTo
        );
    }


    const queryString =
        query.toString();


    //Use date filters only when selected
    const analyticsUrl =
        queryString
            ? `${API_URL}/api/dashboard/bakery?${queryString}`
            : `${API_URL}/api/dashboard/bakery`;


    //Load Dashboard Analytics and Orders together
    const [
        analyticsResponse,
        ordersResponse
    ] = await Promise.all([

        fetch(
            analyticsUrl,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        ),

        fetch(
            `${API_URL}/api/orders/bakery`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        )
    ]);


    const analyticsResult =
        await analyticsResponse.json();

    const ordersResult =
        await ordersResponse.json();


    //Stop if Analytics could not be loaded
    if (!analyticsResponse.ok) {

        throw new Error(
            analyticsResult.message ||
            "Unable to load analytics."
        );
    }


    //Stop if Orders could not be loaded
    if (!ordersResponse.ok) {

        throw new Error(
            ordersResult.message ||
            "Unable to load orders."
        );
    }


    //Return both API results
    return {

        analytics:
            analyticsResult,

        orders:
            ordersResult.orders || []
    };
}


//Creates a simple YYYY-MM-DD date value
function getLocalDateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


//Creates the Sales data used by the graph
function createSalesChartData(
    orders,
    numberOfDays
) {

    //Stores each day shown on the graph
    const chartData = [];


    //Get today's date
    const today =
        new Date();


    //Start today at midnight
    today.setHours(
        0,
        0,
        0,
        0
    );


    //Create one graph item for every day
    for (
        let daysAgo = numberOfDays - 1;
        daysAgo >= 0;
        daysAgo--
    ) {

        //Create a copy of today's date
        const date =
            new Date(today);


        //Move backwards to the correct graph day
        date.setDate(
            today.getDate() -
            daysAgo
        );


        //Add the day to the graph
        chartData.push({

            date:
                getLocalDateKey(
                    date
                ),

            label:
                date.toLocaleDateString(
                    "en-CA",
                    {
                        month: "short",
                        day: "numeric"
                    }
                ),

            fullLabel:
                date.toLocaleDateString(
                    "en-CA",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                ),

            //Revenue starts at zero
            revenue: 0
        });
    }


    //Create a quick way to find a graph day by date
    const dateMap =
        new Map(
            chartData.map(
                (item) => [
                    item.date,
                    item
                ]
            )
        );


    //Go through every Bakery Order
    orders.forEach(
        (order) => {

            //Skip Orders without a creation date
            if (!order.created_at) {

                return;
            }


            //Convert Order date into JavaScript date
            const orderDate =
                new Date(
                    order.created_at
                );


            //Create the same date format used by the graph
            const dateKey =
                getLocalDateKey(
                    orderDate
                );


            //Find the matching graph day
            const chartDay =
                dateMap.get(
                    dateKey
                );


            //Add the Order's paid amount to that day
            if (chartDay) {

                chartDay.revenue +=
                    Number(
                        order.amount_paid ||
                        0
                    );
            }
        }
    );


    return chartData;
}


//Gets Revenue from the previous matching period
function getPreviousPeriodRevenue(
    orders,
    numberOfDays
) {

    //Get today's date
    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    //Previous period ends before the current period starts
    const previousEnd =
        new Date(today);


    previousEnd.setDate(
        today.getDate() -
        numberOfDays
    );


    previousEnd.setHours(
        23,
        59,
        59,
        999
    );


    //Calculate the beginning of the previous period
    const previousStart =
        new Date(previousEnd);


    previousStart.setDate(
        previousEnd.getDate() -
        numberOfDays +
        1
    );


    previousStart.setHours(
        0,
        0,
        0,
        0
    );


    //Add Revenue from Orders inside the previous period
    return orders.reduce(
        (
            total,
            order
        ) => {

            //Skip Orders without dates
            if (!order.created_at) {

                return total;
            }


            const orderDate =
                new Date(
                    order.created_at
                );


            //Add this Order when it is inside the previous period
            if (
                orderDate >= previousStart &&
                orderDate <= previousEnd
            ) {

                return total +
                    Number(
                        order.amount_paid ||
                        0
                    );
            }


            return total;
        },
        0
    );
}


//Filters Orders using the selected Analytics date range
function filterOrdersByDateRange(
    orders,
    from,
    to
) {

    return orders.filter(
        (order) => {

            //Skip Orders without dates
            if (!order.created_at) {

                return false;
            }


            const orderDate =
                new Date(
                    order.created_at
                );


            //Check start date
            if (from) {

                const fromDate =
                    new Date(
                        `${from}T00:00:00`
                    );


                if (
                    orderDate <
                    fromDate
                ) {

                    return false;
                }
            }


            //Check end date
            if (to) {

                const toDate =
                    new Date(
                        `${to}T23:59:59.999`
                    );


                if (
                    orderDate >
                    toDate
                ) {

                    return false;
                }
            }


            return true;
        }
    );
}


//Gets a simple maximum value for the graph Y-axis
function getChartMaximum(chartData) {

    //Find the highest Revenue value in the graph
    const highestRevenue =
        Math.max(
            ...chartData.map(
                (item) =>
                    item.revenue
            ),
            0
        );


    //Keep an empty or small graph readable
    if (highestRevenue <= 100) {

        return 100;
    }


    //Round the highest Revenue up to the next $100
    return Math.ceil(
        highestRevenue / 100
    ) * 100;
}


//Creates the SVG line that connects all Sales points
function createChartPath(points) {

    //Stop if there are no graph points
    if (points.length === 0) {

        return "";
    }


    //Start the line at the first graph point
    let path =
        `M ${points[0].x} ${points[0].y}`;


    //Connect every remaining point with a straight line
    for (
        let index = 1;
        index < points.length;
        index++
    ) {

        path +=
            ` L ${points[index].x} ${points[index].y}`;
    }


    return path;
}


//Displays Bakery Analytics
export default function BakeryAnalytics() {

    //Stores Bakery Analytics information
    const [
        analyticsData,
        setAnalyticsData
    ] = useState(null);

    //Stores Bakery Orders
    const [
        orders,
        setOrders
    ] = useState([]);

    //Tracks Analytics loading
    const [
        isLoading,
        setIsLoading
    ] = useState(true);

    //Stores Analytics errors
    const [
        error,
        setError
    ] = useState("");

    //Stores selected start date
    const [
        fromDate,
        setFromDate
    ] = useState("");

    //Stores selected end date
    const [
        toDate,
        setToDate
    ] = useState("");

    //Tracks Sales graph period
    const [
        chartDays,
        setChartDays
    ] = useState(7);

    //Tracks the graph point currently being hovered
    const [
        hoveredChartPoint,
        setHoveredChartPoint
    ] = useState(null);


    //Loads Bakery Analytics after a filter action
    async function loadAnalytics(
        selectedFrom = "",
        selectedTo = ""
    ) {

        setIsLoading(true);
        setError("");


        try {

            const result =
                await fetchAnalyticsData(
                    selectedFrom,
                    selectedTo
                );


            //Store Analytics information
            setAnalyticsData(
                result.analytics
            );


            //Store Bakery Orders
            setOrders(
                result.orders
            );


        } catch (error) {

            setError(
                error.message
            );


        } finally {

            setIsLoading(false);
        }
    }


    //Loads Analytics when the page first opens
    useEffect(() => {

        let isCancelled = false;


        async function loadInitialAnalytics() {

            try {

                const result =
                    await fetchAnalyticsData();


                //Only update state if the page is still open
                if (!isCancelled) {

                    setAnalyticsData(
                        result.analytics
                    );

                    setOrders(
                        result.orders
                    );
                }


            } catch (error) {

                if (!isCancelled) {

                    setError(
                        error.message
                    );
                }


            } finally {

                if (!isCancelled) {

                    setIsLoading(false);
                }
            }
        }


        loadInitialAnalytics();


        //Stops state updates if the page closes
        return () => {

            isCancelled = true;
        };

    }, []);


    //Applies the selected date range
    function applyDateFilter(event) {

        event.preventDefault();


        loadAnalytics(
            fromDate,
            toDate
        );
    }


    //Clears the selected date range
    function clearDateFilter() {

        setFromDate("");
        setToDate("");


        loadAnalytics();
    }


    //Formats money using Bakery currency
    function formatMoney(amount) {

        return new Intl.NumberFormat(
            "en-CA",
            {
                style: "currency",

                currency:
                    analyticsData?.bakery?.currency ||
                    "CAD"
            }
        ).format(
            Number(amount || 0)
        );
    }


    //Get Analytics summary values
    const summary =
        analyticsData?.summary;


    //Get Orders matching the currently selected date filter
    const filteredOrders =
        filterOrdersByDateRange(
            orders,
            analyticsData?.date_range?.from,
            analyticsData?.date_range?.to
        );


    //Calculate completed Order percentage
    const completionRate =
        summary?.total_orders > 0
            ? Math.round(
                (
                    summary.completed_orders /
                    summary.total_orders
                ) * 100
            )
            : 0;


    //Count cancelled Orders
    const cancelledOrders =
        filteredOrders.filter(
            (order) =>
                order.status ===
                "cancelled"
        ).length;


    //Calculate cancellation percentage
    const cancellationRate =
        summary?.total_orders > 0
            ? Math.round(
                (
                    cancelledOrders /
                    summary.total_orders
                ) * 100
            )
            : 0;


    //Count fully paid Orders
    const paidOrders =
        filteredOrders.filter(
            (order) =>
                order.payment_status ===
                "paid"
        ).length;


    //Calculate fully paid Order percentage
    const paidOrderRate =
        summary?.total_orders > 0
            ? Math.round(
                (
                    paidOrders /
                    summary.total_orders
                ) * 100
            )
            : 0;


    //Count active Orders still waiting for payment
    const outstandingOrders =
        filteredOrders.filter(
            (order) =>
                order.payment_status !==
                    "paid" &&
                order.status !==
                    "cancelled" &&
                order.status !==
                    "completed"
        ).length;


    //Create the Sales information for the selected graph period
    const salesChartData =
        createSalesChartData(
            orders,
            chartDays
        );


    //Add all Revenue values shown in the current graph period
    const currentPeriodRevenue =
        salesChartData.reduce(
            (
                total,
                item
            ) =>
                total +
                item.revenue,
            0
        );


    //Get Revenue from the previous matching period
    const previousPeriodRevenue =
        getPreviousPeriodRevenue(
            orders,
            chartDays
        );


    //Calculate dollar difference between periods
    const revenueDifference =
        currentPeriodRevenue -
        previousPeriodRevenue;


    //Calculate percentage difference from previous period
    const revenuePercentageChange =
        previousPeriodRevenue > 0
            ? (
                revenueDifference /
                previousPeriodRevenue
            ) * 100
            : null;


    /*
        SALES GRAPH

        The graph uses SVG.

        1. Orders are grouped by date.
        2. Each day gets a Revenue value.
        3. Each day is converted into an X and Y position.
        4. SVG draws a line between those points.
    */


    //Width and height used by the SVG graph
    const chartWidth =
        1000;

    const chartHeight =
        300;


    //Creates empty space around the graph
    //Left space is larger because Revenue labels appear there
    const chartPadding = {
        top: 20,
        right: 25,
        bottom: 45,
        left: 70
    };


    //Find the maximum Revenue value for the Y-axis
    const chartMaximum =
        getChartMaximum(
            salesChartData
        );


    //Turn every day's Revenue into an X and Y position
    const chartPoints =
        salesChartData.map(
            (
                item,
                index
            ) => {

                //Width available for drawing the line
                const availableWidth =
                    chartWidth -
                    chartPadding.left -
                    chartPadding.right;


                //Height available for drawing the line
                const availableHeight =
                    chartHeight -
                    chartPadding.top -
                    chartPadding.bottom;


                /*
                    X position represents the date.

                    The first date appears on the left.
                    The last date appears on the right.
                */
                const x =
                    salesChartData.length > 1
                        ? chartPadding.left +
                        (
                            index /
                            (
                                salesChartData.length -
                                1
                            )
                        ) *
                        availableWidth
                        : chartPadding.left;


                /*
                    Y position represents Revenue.

                    Higher Revenue moves the point
                    higher on the graph.
                */
                const y =
                    chartPadding.top +
                    (
                        1 -
                        (
                            item.revenue /
                            chartMaximum
                        )
                    ) *
                    availableHeight;


                //Keep the Sales data and add graph coordinates
                return {
                    ...item,
                    x,
                    y
                };
            }
        );


    //Connect all graph points together
    const salesChartPath =
        createChartPath(
            chartPoints
        );


    /*
        Control how many date labels appear.

        7 Days = every day
        30 Days = every 5 days
        3 Months = every 15 days
    */
    const chartLabelInterval =
        chartDays === 7
            ? 1
            : chartDays === 30
                ? 5
                : 15;


    //Create five Revenue labels on the Y-axis
    const yAxisValues = [
        chartMaximum,
        chartMaximum * 0.75,
        chartMaximum * 0.5,
        chartMaximum * 0.25,
        0
    ];


    //Size of the Tooltip shown when hovering a point
    const tooltipWidth =
        145;

    const tooltipHeight =
        58;


    //Default Tooltip position
    let tooltipX = 0;
    let tooltipY = 0;


    //Move Tooltip close to the selected graph point
    if (hoveredChartPoint) {

        /*
            Keep the Tooltip inside
            the left and right side of the graph.
        */
        tooltipX =
            Math.min(
                Math.max(
                    hoveredChartPoint.x -
                    tooltipWidth / 2,
                    chartPadding.left
                ),
                chartWidth -
                chartPadding.right -
                tooltipWidth
            );


        //Show Tooltip above the selected point
        tooltipY =
            Math.max(
                hoveredChartPoint.y -
                75,
                chartPadding.top
            );
    }


    return (

        <div className="bakery-analytics-page p-3 p-md-4">


            {/* Analytics page heading */}
            <div className="d-flex align-items-center justify-content-between gap-3 mb-4">

                <div>

                    <h1 className="bakery-analytics-title mb-1">
                        Analytics
                    </h1>

                    <p className="bakery-analytics-description mb-0">
                        Track bakery sales, orders,
                        customers, and performance.
                    </p>

                </div>

            </div>


            {/* Analytics date filter */}
            <form
                className="bakery-analytics-filter p-3 p-md-4 mb-4"
                onSubmit={
                    applyDateFilter
                }
            >

                <div className="row g-3 align-items-end">


                    {/* From date */}
                    <div className="col-12 col-sm-6 col-lg-auto">

                        <label
                            htmlFor="analyticsFromDate"
                            className="form-label"
                        >
                            From
                        </label>

                        <input
                            type="date"
                            id="analyticsFromDate"
                            className="form-control"
                            value={
                                fromDate
                            }
                            onChange={(event) =>
                                setFromDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* To date */}
                    <div className="col-12 col-sm-6 col-lg-auto">

                        <label
                            htmlFor="analyticsToDate"
                            className="form-label"
                        >
                            To
                        </label>

                        <input
                            type="date"
                            id="analyticsToDate"
                            className="form-control"
                            value={
                                toDate
                            }
                            onChange={(event) =>
                                setToDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* Filter actions */}
                    <div className="col-12 col-lg-auto">

                        <div className="d-flex flex-wrap gap-2">

                            <button
                                type="submit"
                                className="bakery-analytics-primary-button px-3 py-2"
                                disabled={
                                    isLoading
                                }
                            >
                                Apply
                            </button>


                            <button
                                type="button"
                                className="bakery-analytics-secondary-button px-3 py-2"
                                onClick={
                                    clearDateFilter
                                }
                                disabled={
                                    isLoading
                                }
                            >
                                Clear
                            </button>

                        </div>

                    </div>

                </div>

            </form>


            {/* Analytics loading */}
            {isLoading && (

                <div className="d-flex align-items-center justify-content-center gap-2 py-5 bakery-analytics-loading">

                    <div
                        className="spinner-border spinner-border-sm"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading analytics...
                        </span>
                    </div>

                    <span>
                        Loading analytics...
                    </span>

                </div>

            )}


            {/* Analytics error */}
            {error && !isLoading && (

                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>

            )}


            {/* Analytics content */}
            {!isLoading &&
                !error &&
                summary && (

                <>


                    {/* Analytics summary cards */}
                    <div className="row g-3">


                        {/* Revenue */}
                        <div className="col-12 col-sm-6 col-xl">

                            <div className="bakery-analytics-stat-card h-100 p-3">

                                <p className="mb-1">
                                    Revenue
                                </p>

                                <h2 className="mb-0">
                                    {
                                        formatMoney(
                                            summary.revenue
                                        )
                                    }
                                </h2>

                            </div>

                        </div>


                        {/* Total Orders */}
                        <div className="col-12 col-sm-6 col-xl">

                            <div className="bakery-analytics-stat-card h-100 p-3">

                                <p className="mb-1">
                                    Total Orders
                                </p>

                                <h2 className="mb-0">
                                    {
                                        summary.total_orders
                                    }
                                </h2>

                            </div>

                        </div>


                        {/* Completed Orders */}
                        <div className="col-12 col-sm-6 col-xl">

                            <div className="bakery-analytics-stat-card h-100 p-3">

                                <p className="mb-1">
                                    Completed
                                </p>

                                <h2 className="mb-0">
                                    {
                                        summary.completed_orders
                                    }
                                </h2>

                            </div>

                        </div>


                        {/* Average Order Value */}
                        <div className="col-12 col-sm-6 col-xl">

                            <div className="bakery-analytics-stat-card h-100 p-3">

                                <p className="mb-1">
                                    Avg. Order
                                </p>

                                <h2 className="mb-0">
                                    {
                                        formatMoney(
                                            summary.average_order_value
                                        )
                                    }
                                </h2>

                            </div>

                        </div>


                        {/* Customers */}
                        <div className="col-12 col-sm-6 col-xl">

                            <div className="bakery-analytics-stat-card h-100 p-3">

                                <p className="mb-1">
                                    Customers
                                </p>

                                <h2 className="mb-0">
                                    {
                                        summary.customers
                                    }
                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* Sales Overview graph */}
                    <div className="bakery-analytics-section mt-4">

                        <div className="p-3 p-md-4">


                            {/* Graph heading */}
                            <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4">

                                <div>

                                    <h2 className="bakery-analytics-chart-title mb-2">
                                        Sales Overview
                                    </h2>


                                    {/* Current Revenue and percentage change */}
                                    <div className="d-flex align-items-center flex-wrap gap-2">

                                        <h3 className="bakery-analytics-chart-total mb-0">
                                            {
                                                formatMoney(
                                                    currentPeriodRevenue
                                                )
                                            }
                                        </h3>


                                        {revenuePercentageChange !== null && (

                                            <span
                                                className={
                                                    revenueDifference >= 0
                                                        ? "bakery-analytics-change-badge positive"
                                                        : "bakery-analytics-change-badge negative"
                                                }
                                            >

                                                {
                                                    revenueDifference >= 0
                                                        ? "+"
                                                        : ""
                                                }

                                                {
                                                    revenuePercentageChange.toFixed(
                                                        1
                                                    )
                                                }% vs prev.

                                            </span>

                                        )}

                                    </div>


                                    {/* Dollar difference from previous period */}
                                    <p className="bakery-analytics-chart-comparison mb-0 mt-1">

                                        {
                                            revenueDifference >= 0
                                                ? "+"
                                                : "-"
                                        }

                                        {
                                            formatMoney(
                                                Math.abs(
                                                    revenueDifference
                                                )
                                            )
                                        } from previous period

                                    </p>

                                </div>


                                {/* Graph period buttons */}
                                <div
                                    className="btn-group bakery-analytics-period-buttons"
                                    role="group"
                                    aria-label="Sales graph period"
                                >

                                    <button
                                        type="button"
                                        className={
                                            chartDays === 7
                                                ? "btn active"
                                                : "btn"
                                        }
                                        onClick={() =>
                                            setChartDays(
                                                7
                                            )
                                        }
                                    >
                                        7 Days
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            chartDays === 30
                                                ? "btn active"
                                                : "btn"
                                        }
                                        onClick={() =>
                                            setChartDays(
                                                30
                                            )
                                        }
                                    >
                                        30 Days
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            chartDays === 90
                                                ? "btn active"
                                                : "btn"
                                        }
                                        onClick={() =>
                                            setChartDays(
                                                90
                                            )
                                        }
                                    >
                                        3 Months
                                    </button>

                                </div>

                            </div>


                            {/* Allow graph to scroll on smaller screens */}
                            <div className="overflow-auto">


                                {/*
                                    SVG is used to draw the Sales graph.

                                    The grid lines, Revenue line,
                                    points, dates, and Tooltip are all
                                    drawn inside this SVG.
                                */}
                                <svg
                                    className="bakery-analytics-sales-chart w-100"
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                    role="img"
                                    aria-label="Bakery sales overview graph"
                                    onMouseLeave={() =>
                                        setHoveredChartPoint(
                                            null
                                        )
                                    }
                                >


                                    {/* Draw horizontal Revenue guide lines */}
                                    {yAxisValues.map(
                                        (
                                            value,
                                            index
                                        ) => {

                                            //Height available inside the graph
                                            const usableHeight =
                                                chartHeight -
                                                chartPadding.top -
                                                chartPadding.bottom;


                                            //Calculate where this guide line appears
                                            const y =
                                                chartPadding.top +
                                                (
                                                    index /
                                                    (
                                                        yAxisValues.length -
                                                        1
                                                    )
                                                ) *
                                                usableHeight;


                                            return (

                                                <g
                                                    key={
                                                        value
                                                    }
                                                >

                                                    {/* Horizontal guide line */}
                                                    <line
                                                        className="bakery-analytics-chart-grid"
                                                        x1={
                                                            chartPadding.left
                                                        }
                                                        x2={
                                                            chartWidth -
                                                            chartPadding.right
                                                        }
                                                        y1={
                                                            y
                                                        }
                                                        y2={
                                                            y
                                                        }
                                                    />


                                                    {/* Revenue value beside guide line */}
                                                    <text
                                                        className="bakery-analytics-chart-axis-text"
                                                        x={
                                                            chartPadding.left -
                                                            12
                                                        }
                                                        y={
                                                            y + 4
                                                        }
                                                        textAnchor="end"
                                                    >
                                                        {
                                                            formatMoney(
                                                                value
                                                            )
                                                        }
                                                    </text>

                                                </g>

                                            );
                                        }
                                    )}


                                    {/* Connect all daily Revenue points */}
                                    <path
                                        className="bakery-analytics-chart-line"
                                        d={
                                            salesChartPath
                                        }
                                    />


                                    {/* Draw one graph point for each date */}
                                    {chartPoints.map(
                                        (
                                            point,
                                            index
                                        ) => {

                                            /*
                                                Only show selected date labels
                                                when the graph contains many days.
                                            */
                                            const showLabel =
                                                index %
                                                    chartLabelInterval ===
                                                    0 ||
                                                index ===
                                                    chartPoints.length -
                                                    1;


                                            return (

                                                <g
                                                    key={
                                                        point.date
                                                    }
                                                >


                                                    {/*
                                                        Invisible larger circle.

                                                        This makes the small point
                                                        easier to hover with the mouse.
                                                    */}
                                                    <circle
                                                        className="bakery-analytics-chart-hover-target"
                                                        cx={
                                                            point.x
                                                        }
                                                        cy={
                                                            point.y
                                                        }
                                                        r="14"
                                                        onMouseEnter={() =>
                                                            setHoveredChartPoint(
                                                                point
                                                            )
                                                        }
                                                    />


                                                    {/* Visible Revenue point */}
                                                    <circle
                                                        className={
                                                            hoveredChartPoint?.date ===
                                                            point.date
                                                                ? "bakery-analytics-chart-point active"
                                                                : "bakery-analytics-chart-point"
                                                        }
                                                        cx={
                                                            point.x
                                                        }
                                                        cy={
                                                            point.y
                                                        }
                                                        r={
                                                            chartDays === 7
                                                                ? 4
                                                                : 2.5
                                                        }
                                                    />


                                                    {/* Date displayed under graph */}
                                                    {showLabel && (

                                                        <text
                                                            className="bakery-analytics-chart-axis-text"
                                                            x={
                                                                point.x
                                                            }
                                                            y={
                                                                chartHeight -
                                                                12
                                                            }
                                                            textAnchor="middle"
                                                        >
                                                            {
                                                                point.label
                                                            }
                                                        </text>

                                                    )}

                                                </g>

                                            );
                                        }
                                    )}


                                    {/* Show Revenue details when hovering a point */}
                                    {hoveredChartPoint && (

                                        <g
                                            className="bakery-analytics-chart-tooltip"
                                            pointerEvents="none"
                                        >

                                            {/* Tooltip box */}
                                            <rect
                                                x={
                                                    tooltipX
                                                }
                                                y={
                                                    tooltipY
                                                }
                                                width={
                                                    tooltipWidth
                                                }
                                                height={
                                                    tooltipHeight
                                                }
                                                rx="8"
                                            />


                                            {/* Tooltip date */}
                                            <text
                                                className="bakery-analytics-tooltip-date"
                                                x={
                                                    tooltipX +
                                                    12
                                                }
                                                y={
                                                    tooltipY +
                                                    21
                                                }
                                            >
                                                {
                                                    hoveredChartPoint.fullLabel
                                                }
                                            </text>


                                            {/* Tooltip Revenue */}
                                            <text
                                                className="bakery-analytics-tooltip-value"
                                                x={
                                                    tooltipX +
                                                    12
                                                }
                                                y={
                                                    tooltipY +
                                                    43
                                                }
                                            >
                                                Revenue: {
                                                    formatMoney(
                                                        hoveredChartPoint.revenue
                                                    )
                                                }
                                            </text>

                                        </g>

                                    )}

                                </svg>

                            </div>


                            {/* Explain what the graph represents */}
                            <p className="bakery-analytics-chart-note mb-0 mt-2">
                                Revenue is grouped by the date each order was placed.
                            </p>

                        </div>

                    </div>


                    {/* Bakery Performance */}
                    <div className="bakery-analytics-section mt-4">

                        {/* Performance heading */}
                        <div className="bakery-analytics-section-heading p-3">

                            <h2 className="mb-1">
                                Performance
                            </h2>

                            <p className="mb-0">
                                A quick overview of your bakery's
                                order and sales performance.
                            </p>

                        </div>


                        <div className="p-3 p-md-4">

                            <div className="row g-3">


                                {/* Completion Rate */}
                                <div className="col-12 col-md-4">

                                    <div className="bakery-analytics-performance-card h-100 p-3">

                                        <p className="mb-1">
                                            Completion Rate
                                        </p>

                                        <h3 className="mb-1">
                                            {completionRate}%
                                        </h3>

                                        <span>
                                            {
                                                summary.completed_orders
                                            } of {
                                                summary.total_orders
                                            } orders completed
                                        </span>

                                    </div>

                                </div>


                                {/* Completed Sales */}
                                <div className="col-12 col-md-4">

                                    <div className="bakery-analytics-performance-card h-100 p-3">

                                        <p className="mb-1">
                                            Completed Sales
                                        </p>

                                        <h3 className="mb-1">
                                            {
                                                formatMoney(
                                                    summary.total_sales
                                                )
                                            }
                                        </h3>

                                        <span>
                                            Value of completed orders
                                        </span>

                                    </div>

                                </div>


                                {/* Revenue Collected */}
                                <div className="col-12 col-md-4">

                                    <div className="bakery-analytics-performance-card h-100 p-3">

                                        <p className="mb-1">
                                            Revenue Collected
                                        </p>

                                        <h3 className="mb-1">
                                            {
                                                formatMoney(
                                                    summary.revenue
                                                )
                                            }
                                        </h3>

                                        <span>
                                            Amount recorded as paid
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* Order Health */}
                    <div className="bakery-analytics-section mt-4">

                        {/* Order Health heading */}
                        <div className="bakery-analytics-section-heading p-3">

                            <h2 className="mb-1">
                                Order Health
                            </h2>

                            <p className="mb-0">
                                Review cancellations,
                                payments, and outstanding orders.
                            </p>

                        </div>


                        <div className="p-3 p-md-4">

                            <div className="row g-3">


                                {/* Cancellation Rate */}
                                <div className="col-12 col-md-4">

                                    <div className="bakery-analytics-performance-card h-100 p-3">

                                        <p className="mb-1">
                                            Cancellation Rate
                                        </p>

                                        <h3 className="mb-1">
                                            {cancellationRate}%
                                        </h3>

                                        <span>
                                            {
                                                cancelledOrders
                                            } of {
                                                summary.total_orders
                                            } orders cancelled
                                        </span>

                                    </div>

                                </div>


                                {/* Paid Order Rate */}
                                <div className="col-12 col-md-4">

                                    <div className="bakery-analytics-performance-card h-100 p-3">

                                        <p className="mb-1">
                                            Paid Order Rate
                                        </p>

                                        <h3 className="mb-1">
                                            {paidOrderRate}%
                                        </h3>

                                        <span>
                                            {
                                                paidOrders
                                            } of {
                                                summary.total_orders
                                            } orders fully paid
                                        </span>

                                    </div>

                                </div>


                                {/* Outstanding Orders */}
                                <div className="col-12 col-md-4">

                                    <div className="bakery-analytics-performance-card h-100 p-3">

                                        <p className="mb-1">
                                            Outstanding Orders
                                        </p>

                                        <h3 className="mb-1">
                                            {
                                                outstandingOrders
                                            }
                                        </h3>

                                        <span>
                                            Active orders still awaiting payment
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </>

            )}

        </div>

    );
}