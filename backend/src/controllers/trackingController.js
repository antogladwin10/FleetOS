import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import { getIO } from '../sockets/socketManager.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getLiveFleet = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== 'super_admin') {
      filter.organizationId = req.organizationId;
    }

    const vehicles = await Vehicle.find(filter)
      .select('registrationNumber make model status type lastLocation assignedDriverId currentOdometer')
      .populate('assignedDriverId', 'name phone status rating');

    return sendSuccess(res, { vehicles });
  } catch (err) {
    next(err);
  }
};

export const updateTelemetry = async (req, res, next) => {
  try {
    const { vehicleId, tripId, latitude, longitude, speed = 0, heading = 0, fuelLevelPercent, address } = req.body;
    if (!latitude || !longitude) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    const vehicle = await Vehicle.findById(vehicleId || req.body.vehicle_id);
    if (!vehicle) return sendError(res, 'Vehicle not found', 404);

    vehicle.lastLocation = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      speed: Number(speed),
      heading: Number(heading),
      fuelLevelPercent: fuelLevelPercent !== undefined ? Number(fuelLevelPercent) : vehicle.lastLocation.fuelLevelPercent,
      address: address || vehicle.lastLocation.address,
      updatedAt: new Date(),
    };
    await vehicle.save();

    // If there is an active trip, push waypoint
    if (tripId) {
      await Trip.findByIdAndUpdate(tripId, {
        $push: {
          waypoints: {
            latitude: Number(latitude),
            longitude: Number(longitude),
            speed: Number(speed),
            timestamp: new Date(),
          },
        },
      });
    }

    // Broadcast over Socket.io
    const io = getIO();
    if (io) {
      io.to(`org:${vehicle.organizationId}`).emit('fleet:telemetry_update', {
        vehicleId: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        status: vehicle.status,
        lastLocation: vehicle.lastLocation,
      });
    }

    return sendSuccess(res, { vehicleId: vehicle._id, location: vehicle.lastLocation }, 'Telemetry updated');
  } catch (err) {
    next(err);
  }
};

export const getVehicleRouteHistory = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const latestTrip = await Trip.findOne({ vehicleId, status: { $in: ['IN_PROGRESS', 'COMPLETED'] } })
      .sort({ createdAt: -1 })
      .select('tripNumber origin destination waypoints distanceKm status');

    return sendSuccess(res, { route: latestTrip });
  } catch (err) {
    next(err);
  }
};
