//Import React hooks
import {
    useEffect,
    useState
} from "react";

//Import Pickup Schedule icons
import {
    CalendarDays,
    Clock3,
    Plus,
    LoaderCircle,
    CircleCheck,
    CircleOff,
    Trash2,
    X
} from "lucide-react";

//Import authentication helper
import { getAuthToken } from "../../utils/authStorage.js";

//Import Pickup Schedule styles
import "./styles/PickupSlots.css";


//Formats Pickup Slot time using a 12-hour clock
function formatPickupTime(time) {

    if (!time) {
        return "";
    }

    //Keep stored AM or PM times consistent
    if (
        time.toLowerCase().includes("am") ||
        time.toLowerCase().includes("pm") ||
        time.toLowerCase().includes("a.m.") ||
        time.toLowerCase().includes("p.m.")
    ) {
        return time
            .replace(/a\.m\./gi, "AM")
            .replace(/p\.m\./gi, "PM")
            .replace(/\bam\b/gi, "AM")
            .replace(/\bpm\b/gi, "PM");
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
        Number(hours),
        Number(minutes),
        0
    );

    return date
        .toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }
        )
        .replace(/\bam\b/gi, "AM")
        .replace(/\bpm\b/gi, "PM");
}


//Formats the complete Pickup window
function formatPickupWindow(
    startTime,
    endTime
) {

    return `${formatPickupTime(startTime)} - ${formatPickupTime(endTime)}`;
}


//Adds weeks to a Pickup Slot date
function addWeeksToDate(
    dateString,
    weeks
) {

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    const date = new Date(
        Date.UTC(
            year,
            month - 1,
            day
        )
    );

    date.setUTCDate(
        date.getUTCDate() + (weeks * 7)
    );

    return date
        .toISOString()
        .split("T")[0];
}


//Gets today's date for the date input
function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


//Gets all Pickup Slots belonging to the authenticated Bakery
async function getBakeryPickupSlots() {

    const token = getAuthToken();

    const response = await fetch(
        "http://localhost:3000/api/pickup-slots/bakery",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to load pickup slots"
        );
    }

    return data.pickupSlots || [];
}


//Displays and manages the Bakery pickup schedule
export default function BakeryPickupSlots() {

    //Stores all Pickup Slots
    const [pickupSlots, setPickupSlots] = useState([]);

    //Tracks whether Pickup Slots are loading
    const [isLoading, setIsLoading] = useState(true);

    //Stores any Pickup Slot error
    const [error, setError] = useState("");

    //Tracks whether the Add Pickup Slot form is open
    const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);

    //Stores the new Pickup Slot date
    const [pickupDate, setPickupDate] = useState("");

    //Stores the Pickup window start time
    const [pickupStartTime, setPickupStartTime] = useState("");

    //Stores the Pickup window end time
    const [pickupEndTime, setPickupEndTime] = useState("");

    //Tracks whether the Pickup Slot repeats weekly
    const [repeatWeekly, setRepeatWeekly] = useState(false);

    //Stores how many weekly Pickup Slots should be created
    const [repeatWeeks, setRepeatWeeks] = useState("4");

    //Tracks whether Pickup Slots are being created
    const [isCreating, setIsCreating] = useState(false);

    //Tracks the Pickup Slot currently being updated
    const [updatingSlotId, setUpdatingSlotId] = useState(null);

    //Tracks the Pickup Slot currently being deleted
    const [deletingSlotId, setDeletingSlotId] = useState(null);

    //Stores the Pickup Slot waiting for delete confirmation
    const [deleteConfirmSlot, setDeleteConfirmSlot] = useState(null);


    //Load Pickup Slots when the page opens
    useEffect(() => {

        let isCancelled = false;

        async function loadPickupSlots() {

            try {

                const slots =
                    await getBakeryPickupSlots();

                if (!isCancelled) {

                    setPickupSlots(slots);
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

        loadPickupSlots();


        //Stops state updates if the page closes before loading finishes
        return () => {
            isCancelled = true;
        };

    }, []);


    //Closes and resets the Add Pickup Slot form
    function closeAddSlotForm() {

        setIsAddSlotOpen(false);

        setPickupDate("");
        setPickupStartTime("");
        setPickupEndTime("");

        setRepeatWeekly(false);
        setRepeatWeeks("4");

        setError("");
    }


    //Creates one or more Pickup Slots
    async function createPickupSlot(event) {

        event.preventDefault();

        setError("");


        //Validate Pickup window
        if (
            pickupEndTime <= pickupStartTime
        ) {

            setError(
                "Pickup end time must be later than the start time."
            );

            return;
        }


        setIsCreating(true);

        try {

            const token = getAuthToken();

            //Determines how many Pickup Slots should be created
            const numberOfSlots = repeatWeekly
                ? Number(repeatWeeks)
                : 1;

            //Creates the formatted Pickup window
            const pickupWindow =
                formatPickupWindow(
                    pickupStartTime,
                    pickupEndTime
                );


            //Create each Pickup Slot
            for (
                let week = 0;
                week < numberOfSlots;
                week++
            ) {

                const slotDate =
                    addWeeksToDate(
                        pickupDate,
                        week
                    );

                const response = await fetch(
                    "http://localhost:3000/api/pickup-slots",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            pickup_date: slotDate,
                            pickup_time: pickupWindow
                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to create pickup slot"
                    );
                }
            }


            //Reload Pickup Slots after creation
            const updatedSlots =
                await getBakeryPickupSlots();

            setPickupSlots(updatedSlots);


            //Reset form
            setPickupDate("");
            setPickupStartTime("");
            setPickupEndTime("");

            setRepeatWeekly(false);
            setRepeatWeeks("4");

            setIsAddSlotOpen(false);


        } catch (error) {

            setError(error.message);

        } finally {

            setIsCreating(false);
        }
    }

    //Updates Pickup Slot availability
    async function updatePickupSlotAvailability(slot) {

        setUpdatingSlotId(slot._id);
        setError("");

        try {

            const token = getAuthToken();

            const response = await fetch(
                `http://localhost:3000/api/pickup-slots/${slot._id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        is_available: !slot.is_available
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to update pickup availability"
                );
            }


            //Update the Pickup Slot on the page
            setPickupSlots((currentSlots) =>
                currentSlots.map((currentSlot) =>
                    currentSlot._id === slot._id
                        ? {
                            ...currentSlot,
                            is_available: !currentSlot.is_available
                        }
                        : currentSlot
                )
            );

        } catch (error) {

            setError(error.message);

        } finally {

            setUpdatingSlotId(null);
        }
    }

    //Deletes a Pickup Slot
    async function deletePickupSlot(slot) {

        setDeletingSlotId(slot._id);
        setError("");

        try {

            const token = getAuthToken();

            const response = await fetch(
                `http://localhost:3000/api/pickup-slots/${slot._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to delete pickup slot"
                );
            }


            //Remove the deleted Pickup Slot from the page
            setPickupSlots((currentSlots) =>
                currentSlots.filter(
                    (currentSlot) =>
                        currentSlot._id !== slot._id
                )
            );


            //Close delete confirmation
            setDeleteConfirmSlot(null);

        } catch (error) {

            setError(error.message);

        } finally {

            setDeletingSlotId(null);
        }
    }


    return (
        <div className="bakery-pickup-page">

            {/* Pickup Schedule heading */}
            <div className="bakery-pickup-heading">

                <div>

                    <h1>
                        Pickup Schedule
                    </h1>

                    <p>
                        Create and manage the pickup availability
                        offered to your customers.
                    </p>

                </div>


                <button
                    type="button"
                    className="bakery-pickup-add-button"
                    onClick={() =>
                        setIsAddSlotOpen(true)
                    }
                >
                    <Plus
                        size={17}
                        strokeWidth={2}
                    />

                    Add pickup availability
                </button>

            </div>


            {/* Add Pickup Slot form */}
            {isAddSlotOpen && (

                <div className="bakery-pickup-form-card">

                    <div className="bakery-pickup-form-heading">

                        <div>

                            <h2>
                                Add pickup availability
                            </h2>

                            <p>
                                Choose when customers can collect
                                their orders from your bakery.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="bakery-pickup-form-close"
                            disabled={isCreating}
                            onClick={closeAddSlotForm}
                        >
                            Cancel
                        </button>

                    </div>


                    <form onSubmit={createPickupSlot}>

                        <div className="row g-3">

                            {/* Pickup date */}
                            <div className="col-12 col-lg-4">

                                <label
                                    htmlFor="pickupDate"
                                    className="form-label"
                                >
                                    Pickup date
                                </label>

                                <input
                                    type="date"
                                    id="pickupDate"
                                    className="form-control"
                                    value={pickupDate}
                                    min={getTodayDate()}
                                    onChange={(event) =>
                                        setPickupDate(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            {/* Pickup start time */}
                            <div className="col-12 col-md-6 col-lg-4">

                                <label
                                    htmlFor="pickupStartTime"
                                    className="form-label"
                                >
                                    From
                                </label>

                                <input
                                    type="time"
                                    id="pickupStartTime"
                                    className="form-control"
                                    value={pickupStartTime}
                                    onChange={(event) =>
                                        setPickupStartTime(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            {/* Pickup end time */}
                            <div className="col-12 col-md-6 col-lg-4">

                                <label
                                    htmlFor="pickupEndTime"
                                    className="form-label"
                                >
                                    To
                                </label>

                                <input
                                    type="time"
                                    id="pickupEndTime"
                                    className="form-control"
                                    value={pickupEndTime}
                                    onChange={(event) =>
                                        setPickupEndTime(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        </div>


                        {/* Pickup window preview */}
                        {pickupStartTime &&
                            pickupEndTime &&
                            pickupEndTime > pickupStartTime && (

                                <div className="bakery-pickup-window-preview">

                                    <Clock3
                                        size={16}
                                        strokeWidth={1.8}
                                    />

                                    <div>

                                        <span>
                                            Pickup window
                                        </span>

                                        <strong>
                                            {formatPickupWindow(
                                                pickupStartTime,
                                                pickupEndTime
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            )
                        }


                        {/* Weekly recurrence */}
                        <div className="bakery-pickup-repeat">

                            <div className="bakery-pickup-repeat-toggle">

                                <input
                                    type="checkbox"
                                    id="repeatWeekly"
                                    checked={repeatWeekly}
                                    onChange={(event) =>
                                        setRepeatWeekly(
                                            event.target.checked
                                        )
                                    }
                                />

                                <label htmlFor="repeatWeekly">

                                    <strong>
                                        Repeat weekly
                                    </strong>

                                    <span>
                                        Automatically create this
                                        pickup window for upcoming weeks.
                                    </span>

                                </label>

                            </div>


                            {/* Number of weeks */}
                            {repeatWeekly && (

                                <div className="bakery-pickup-repeat-weeks">

                                    <label htmlFor="repeatWeeks">
                                        Create for
                                    </label>

                                    <select
                                        id="repeatWeeks"
                                        className="form-select"
                                        value={repeatWeeks}
                                        onChange={(event) =>
                                            setRepeatWeeks(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="2">
                                            2 weeks
                                        </option>

                                        <option value="4">
                                            4 weeks
                                        </option>

                                        <option value="8">
                                            8 weeks
                                        </option>

                                        <option value="12">
                                            12 weeks
                                        </option>
                                    </select>

                                </div>

                            )}

                        </div>


                        {/* Form actions */}
                        <div className="bakery-pickup-form-actions">

                            <button
                                type="button"
                                className="bakery-pickup-cancel-button"
                                disabled={isCreating}
                                onClick={closeAddSlotForm}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="bakery-pickup-add-button"
                                disabled={isCreating}
                            >
                                <Plus
                                    size={17}
                                    strokeWidth={2}
                                />

                                {isCreating
                                    ? "Adding..."
                                    : repeatWeekly
                                        ? "Add pickup slots"
                                        : "Add pickup availability"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* Loading state */}
            {isLoading && (

                <div className="bakery-pickup-loading">

                    <LoaderCircle
                        size={26}
                        strokeWidth={1.8}
                        className="bakery-pickup-loading-icon"
                    />

                    <div>

                        <strong>
                            Loading pickup schedule
                        </strong>

                        <span>
                            Getting your latest pickup availability...
                        </span>

                    </div>

                </div>

            )}


            {/* Error state */}
            {!isLoading && error && (

                <div className="bakery-pickup-error">
                    {error}
                </div>

            )}


            {/* Empty state */}
            {!isLoading &&
                !error &&
                pickupSlots.length === 0 && (

                    <div className="bakery-pickup-empty">

                        <CalendarDays
                            size={30}
                            strokeWidth={1.6}
                        />

                        <h2>
                            No pickup availability yet
                        </h2>

                        <p>
                            Add pickup dates and time windows so
                            customers can choose when to collect
                            their orders.
                        </p>

                        <button
                            type="button"
                            className="bakery-pickup-add-button"
                            onClick={() =>
                                setIsAddSlotOpen(true)
                            }
                        >
                            <Plus
                                size={17}
                                strokeWidth={2}
                            />

                            Add pickup availability
                        </button>

                    </div>

                )
            }


            {/* Pickup Slots */}
            {!isLoading &&
                !error &&
                pickupSlots.length > 0 && (

                    <div className="bakery-pickup-card">

                        <div className="table-responsive">

                            <table className="table mb-0 bakery-pickup-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Pickup window
                                        </th>

                                        <th>
                                            Availability
                                        </th>

                                        <th className="text-end">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {pickupSlots.map((slot) => (

                                        <tr key={slot._id}>

                                            {/* Pickup date */}
                                            <td>

                                                <div className="bakery-pickup-date">

                                                    <CalendarDays
                                                        size={16}
                                                        strokeWidth={1.8}
                                                    />

                                                    <span>

                                                        {new Date(
                                                            slot.pickup_date
                                                        ).toLocaleDateString(
                                                            "en-CA",
                                                            {
                                                                weekday: "short",
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                                timeZone: "UTC"
                                                            }
                                                        )}

                                                    </span>

                                                </div>

                                            </td>


                                            {/* Pickup window */}
                                            <td>

                                                <div className="bakery-pickup-time">

                                                    <Clock3
                                                        size={15}
                                                        strokeWidth={1.8}
                                                    />

                                                    {formatPickupTime(
                                                        slot.pickup_time
                                                    )}

                                                </div>

                                            </td>


                                            {/* Availability */}
                                            <td>

                                                <span
                                                    className={
                                                        slot.is_available
                                                            ? "bakery-pickup-status available"
                                                            : "bakery-pickup-status unavailable"
                                                    }
                                                >
                                                    {slot.is_available
                                                        ? "Available"
                                                        : "Unavailable"
                                                    }
                                                </span>

                                            </td>


                                            {/* Pickup Slot actions */}
                                            <td>

                                                <div className="bakery-pickup-actions">

                                                    {/* Availability action */}
                                                    <button
                                                        type="button"
                                                        className="bakery-pickup-action-button"
                                                        disabled={
                                                            updatingSlotId === slot._id ||
                                                            deletingSlotId === slot._id
                                                        }
                                                        onClick={() =>
                                                            updatePickupSlotAvailability(slot)
                                                        }
                                                    >

                                                        {updatingSlotId === slot._id ? (

                                                            <LoaderCircle
                                                                size={14}
                                                                strokeWidth={1.8}
                                                                className="bakery-pickup-action-spinner"
                                                            />

                                                        ) : slot.is_available ? (

                                                            <CircleOff
                                                                size={14}
                                                                strokeWidth={1.8}
                                                            />

                                                        ) : (

                                                            <CircleCheck
                                                                size={14}
                                                                strokeWidth={1.8}
                                                            />

                                                        )}

                                                        {updatingSlotId === slot._id
                                                            ? "Updating..."
                                                            : slot.is_available
                                                                ? "Mark unavailable"
                                                                : "Make available"
                                                        }

                                                    </button>


                                                    {/* Delete Pickup Slot */}
                                                    <button
                                                        type="button"
                                                        className="bakery-pickup-delete-button"
                                                        disabled={
                                                            deletingSlotId === slot._id ||
                                                            updatingSlotId === slot._id
                                                        }
                                                        onClick={() =>
                                                            setDeleteConfirmSlot(slot)
                                                        }
                                                    >

                                                        {deletingSlotId === slot._id ? (

                                                            <LoaderCircle
                                                                size={14}
                                                                strokeWidth={1.8}
                                                                className="bakery-pickup-action-spinner"
                                                            />

                                                        ) : (

                                                            <Trash2
                                                                size={14}
                                                                strokeWidth={1.8}
                                                            />

                                                        )}

                                                        {deletingSlotId === slot._id
                                                            ? "Deleting..."
                                                            : "Delete"
                                                        }

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )
            }

            {/* Delete Pickup confirmation */}
            {deleteConfirmSlot && (

                <div
                    className="bakery-pickup-modal-overlay"
                    onClick={() => {

                        if (!deletingSlotId) {
                            setDeleteConfirmSlot(null);
                        }
                    }}
                >

                    <div
                        className="bakery-pickup-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="deletePickupTitle"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* Confirmation heading */}
                        <div className="bakery-pickup-modal-heading">

                            <div className="bakery-pickup-modal-icon">
                                <Trash2
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <button
                                type="button"
                                className="bakery-pickup-modal-close"
                                aria-label="Close delete confirmation"
                                disabled={Boolean(deletingSlotId)}
                                onClick={() =>
                                    setDeleteConfirmSlot(null)
                                }
                            >
                                <X
                                    size={18}
                                    strokeWidth={1.8}
                                />
                            </button>

                        </div>


                        <h2 id="deletePickupTitle">
                            Delete pickup availability?
                        </h2>

                        <p>
                            This pickup window will be permanently removed
                            from your schedule.
                        </p>


                        {/* Pickup being deleted */}
                        <div className="bakery-pickup-modal-slot">

                            <div>

                                <CalendarDays
                                    size={16}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    {new Date(
                                        deleteConfirmSlot.pickup_date
                                    ).toLocaleDateString(
                                        "en-CA",
                                        {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                            timeZone: "UTC"
                                        }
                                    )}
                                </span>

                            </div>


                            <div>

                                <Clock3
                                    size={16}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    {formatPickupTime(
                                        deleteConfirmSlot.pickup_time
                                    )}
                                </span>

                            </div>

                        </div>


                        {/* Confirmation actions */}
                        <div className="bakery-pickup-modal-actions">

                            <button
                                type="button"
                                className="bakery-pickup-modal-cancel"
                                disabled={Boolean(deletingSlotId)}
                                onClick={() =>
                                    setDeleteConfirmSlot(null)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="bakery-pickup-modal-delete"
                                disabled={Boolean(deletingSlotId)}
                                onClick={() =>
                                    deletePickupSlot(
                                        deleteConfirmSlot
                                    )
                                }
                            >

                                {deletingSlotId ? (

                                    <LoaderCircle
                                        size={15}
                                        strokeWidth={1.8}
                                        className="bakery-pickup-action-spinner"
                                    />

                                ) : (

                                    <Trash2
                                        size={15}
                                        strokeWidth={1.8}
                                    />

                                )}

                                {deletingSlotId
                                    ? "Deleting..."
                                    : "Delete pickup"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}
        </div>
    );
}