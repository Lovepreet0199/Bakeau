//Displays one reusable statistic card on the Bakery Owner dashboard
export default function DashboardStatCard({
    label,
    value,
    note,
    icon
}) {

    return (
        <div className="col">

            {/* Statistic card */}
            <div className="card h-100 bakery-dashboard-stat-card">

                <div className="card-body">

                    {/* Main statistic information */}
                    <div className="d-flex align-items-start justify-content-between gap-3">

                        <div>

                            {/* Statistic label */}
                            <p className="bakery-dashboard-stat-label mb-2">
                                {label}
                            </p>

                            {/* Statistic value */}
                            <h2 className="bakery-dashboard-stat-value mb-0">
                                {value}
                            </h2>

                        </div>

                        {/* Statistic icon */}
                        <div className="bakery-dashboard-stat-icon">
                            {icon}
                        </div>

                    </div>

                    {/* Supporting statistic text */}
                    <p className="bakery-dashboard-stat-note mb-0 mt-3">
                        {note}
                    </p>

                </div>

            </div>

        </div>
    );
}