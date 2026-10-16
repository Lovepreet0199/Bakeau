//Import Notification model
import Notification from "../models/Notification.js";


//Gets Notifications for the logged-in Bakery Owner
const getMyNotifications = async (
    request,
    response
) => {

    try {

        //Get logged-in user ID
        const userId =
            request.user.userId;


        //Get newest Notifications first
        const notifications =
            await Notification.find({
                user_id: userId
            })
                .sort({
                    created_at: -1
                })
                .limit(20);


        //Count unread Notifications
        const unreadCount =
            await Notification.countDocuments({
                user_id: userId,
                is_read: false
            });


        return response.status(200).json({

            notifications:
                notifications,

            unread_count:
                unreadCount
        });


    } catch (error) {

        console.error(
            "Get notifications error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to get notifications"
        });
    }
};


//Marks one Notification as read
const markNotificationRead = async (
    request,
    response
) => {

    try {

        //Get logged-in user ID
        const userId =
            request.user.userId;

        //Get Notification ID
        const notificationId =
            request.params.id;


        //Find Notification only if it belongs to this user
        const notification =
            await Notification.findOne({
                _id: notificationId,
                user_id: userId
            });


        //Stop if Notification does not exist
        if (!notification) {

            return response.status(404).json({
                message:
                    "Notification not found"
            });
        }


        //Mark Notification as read
        notification.is_read =
            true;


        await notification.save();


        return response.status(200).json({

            message:
                "Notification marked as read",

            notification:
                notification
        });


    } catch (error) {

        console.error(
            "Update notification error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to update notification"
        });
    }
};


//Marks all Notifications as read
const markAllNotificationsRead = async (
    request,
    response
) => {

    try {

        //Get logged-in user ID
        const userId =
            request.user.userId;


        //Update all unread Notifications
        await Notification.updateMany(
            {
                user_id: userId,
                is_read: false
            },
            {
                $set: {
                    is_read: true
                }
            }
        );


        return response.status(200).json({
            message:
                "All notifications marked as read"
        });


    } catch (error) {

        console.error(
            "Mark all notifications error:",
            error.message
        );


        return response.status(500).json({
            message:
                "Unable to update notifications"
        });
    }
};


//Export Notification controller functions
export {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
};