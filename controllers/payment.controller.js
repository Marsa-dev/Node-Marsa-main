const moment = require("moment");
const axios = require("axios");
const Buffer = require("buffer").Buffer;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { BadRequestError } = require("../errors");
const BookingModel = require("../models/booking.model");
const PaymentModel = require("../models/payment.model");
const paymentTemplate = require("../templates/payment");
const bookingModel = require("../models/booking.model");
const BoatModel = require("../models/boat.model");

const PAYMENT_API_URL = "https://api.moyasar.com/v1/payments";

const username = process.env.MOYASOR_USERNAME;
const password = process.env.MOYASOR_PASSWORD;
const authString = `${username}:${password}`;
const moyasorKey = Buffer.from(authString).toString("base64");

exports.createPayment = async (req, res) => {
  const {
    bookingId,
    source: { type, name, number, year, month, cvc },
  } = req.body;

  const find = await BookingModel.findById(bookingId);

  if (!find) {
    throw new BadRequestError("No Booking Found");
  }

  if (find.status !== "accepted") {
    throw new BadRequestError("Your Booking is not accepted yet.");
  }

  if (find.status === "paid") {
    throw new BadRequestError("Your already paid for this booking.");
  }

  if (find.status === "rejected") {
    throw new BadRequestError("Your booking has been rejected.");
  }

  if (find.status === "completed") {
    throw new BadRequestError("Your booking has been completed.");
  }

  const requestProtocol = req.protocol;
  const requestHost = req.get("host");

  const callback_url = `${requestProtocol}://${requestHost}/api/payment/callback`;

  const paymentData = {
    amount: find.totalAmount * 100,
    callback_url,
    source: {
      type,
      name,
      number,
      year,
      month,
      cvc,
    },
  };

  const response = await axios.post(PAYMENT_API_URL, paymentData, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${moyasorKey}`,
    },
  });

  const payment = await PaymentModel.create({
    paymentId: response.data.id,
    bookingId,
    amount: response.data.amount_format,
    status: response.data.status,
  });

  return res.json({ data: response.data.source.transaction_url });
};

exports.paymentCallBack = async (req, res) => {
  const { id } = req.query;

  const find = await PaymentModel.findOne({ paymentId: id });

  if (!find) {
    throw new BadRequestError("No Payment Found");
  }

  const { data } = await axios.get(`${PAYMENT_API_URL}/${id}`, {
    headers: {
      Authorization: `Basic ${moyasorKey}`,
    },
  });

  if (data.status === "paid") {
    await PaymentModel.findOneAndUpdate(
      { paymentId: id },
      {
        status: "paid",
      }
    );
    await BookingModel.findOneAndUpdate(
      { _id: find.bookingId },
      {
        status: "paid",
      }
    );
    return res.status(200).send(paymentTemplate());
    // return res.status(200).json({ success: true, message: "payment Paid" });
  }
  throw new BadRequestError("Payment Was UnsuccessFull");
};

exports.getwalletbyMonth = async (req, res) => {
  const data = await BoatModel.findOne({ vendorId: req.user._id });
  if (!data) {
    return res.status(400).json({ success: false, message: "Create Boat" });
  }

  // Get the current date and time
  const currentDate = moment();

  // Calculate the start of the ongoing month (i.e., the 1st day of the current month)
  const startOfCurrentMonth = currentDate.startOf("month").toDate();

  // Calculate the end of the ongoing month (i.e., the last day of the current month)
  const endOfCurrentMonth = currentDate.endOf("month").toDate();

  const totalIncome = await bookingModel.aggregate([
    {
      $match: {
        boatId: data._id,
        bookingEndTime: {
          $gte: startOfCurrentMonth,
          $lte: endOfCurrentMonth,
        },
        status: "completed",
      },
    },
    {
      $project: {
        _id: 1,
        bookingStartTime: 1,
        bookingEndTime: 1,
        noOfBookings: { $literal: 1 },
        totalAmount: 1,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d", // Group by date (year-month-day)
            date: "$bookingEndTime",
          },
        },
        totalAmount: { $sum: "$totalAmount" },
        noOfBookings: { $sum: 1 },
      },
    },
  ]);

  if (totalIncome.length === 0) {
    return res
      .status(200)
      .json({ success: true, totalIncome: 0, bookings: [] });
  }

  const totalAmount = totalIncome.reduce(
    (sum, month) => sum + month.totalAmount,
    0
  );

  const bookings = totalIncome.map((month) => {
    return {
      date: new Date(month._id), // Convert date string to JavaScript Date object
      totalAmount: month.totalAmount,
      noOfBookings: month.noOfBookings,
    };
  });

  return res
    .status(200)
    .json({ success: true, totalIncome: totalAmount, bookings });
};

exports.getWalletBytoday = async (req, res) => {
  const { _id } = req.user;

  // Get the current date and time
  const currentDate = moment();

  // Calculate the start of today (i.e., the beginning of the current day)
  const startOfToday = currentDate.startOf("day").toDate();

  // Calculate the end of today (i.e., the end of the current day)
  const endOfToday = currentDate.endOf("day").toDate();

  try {
    const data = await BoatModel.findOne({ vendorId: _id });
    if (!data) {
      return res.status(400).json({ success: false, message: "Create Boat" });
    }

    const totalIncome = await bookingModel.aggregate([
      {
        $match: {
          boatId: data._id,
          bookingEndTime: {
            $gte: startOfToday,
            $lte: endOfToday,
          },
          status: "completed",
        },
      },
      {
        $project: {
          _id: 1,
          bookingStartTime: 1,
          bookingEndTime: 1,
          totalAmount: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          bookings: { $push: "$$ROOT" },
        },
      },
    ]);

    if (totalIncome.length === 0) {
      return res
        .status(200)
        .json({ success: true, totalIncome: 0, bookings: [] });
    }

    // Extract the bookings array from the result
    const bookings = totalIncome[0].bookings;

    return res.status(200).json({
      success: true,
      totalIncome: totalIncome[0].totalAmount,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getWalletByYear = async (req, res) => {
  const { _id } = req.user;

  try {
    const data = await BoatModel.findOne({ vendorId: _id });
    if (!data) {
      return res.status(400).json({ success: false, message: "Create Boat" });
    }

    // Get the current date and time
    const currentDate = moment();

    // Calculate the start of the current year (i.e., the 1st day of January of the current year)
    const startOfCurrentYear = currentDate.startOf("year").toDate();

    const bookingsByMonth = await bookingModel.aggregate([
      {
        $match: {
          boatId: data._id,
          bookingEndTime: {
            $gte: startOfCurrentYear,
          },
          status: "completed",
        },
      },
      {
        $project: {
          _id: 1,
          bookingStartTime: 1,
          totalAmount: 1,
        },
      },
      {
        $group: {
          _id: { $month: "$bookingStartTime" },
          totalAmount: { $sum: "$totalAmount" }, // Calculate the total amount for each month
          noOfBookings: { $sum: 1 }, // Calculate the number of bookings for each month
        },
      },
      {
        $project: {
          _id: 0, // Exclude the group _id
          month: {
            $dateFromParts: {
              year: { $year: startOfCurrentYear }, // Use the year of the current year start date
              month: "$_id", // Numeric month value
              day: 1, // Set the day to 1st of the month
            },
          },
          totalAmount: 1,
          noOfBookings: 1,
        },
      },
    ]);
    if (bookingsByMonth.length === 0) {
      return res.status(200).json({ success: true, totalIncome: 0 });
    }

    return res.status(200).json({
      success: true,
      totalIncome: bookingsByMonth[0].totalAmount,
      bookingsByMonth,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPaymentIntent = async (req, res) => {
  const { bookingId } = req.body;
  const find = await BookingModel.findById(bookingId);

  if (!find) {
    throw new BadRequestError("No Booking Found");
  }

  if (find.status !== "accepted") {
    throw new BadRequestError("Your Booking is not accepted yet.");
  }

  if (find.status === "paid") {
    throw new BadRequestError("Your already paid for this booking.");
  }

  if (find.status === "rejected") {
    throw new BadRequestError("Your booking has been rejected.");
  }

  if (find.status === "completed") {
    throw new BadRequestError("Your booking has been completed.");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: find.totalAmount * 100,
    currency: "sar",
    metadata: {
      userId: req.user._id.toString(),
      bookingId: bookingId.toString(),
    },
  });

  const payment = await PaymentModel.create({
    intentId: paymentIntent.id,
    bookingId,
    amount: `${find.totalAmount} ${paymentIntent.currency?.toUpperCase()}`,
    status: "initiated",
  });

  res.status(200).json({ success: true, data: paymentIntent.client_secret });
};

exports.stripeCallBack = async (req, res) => {
  // console.log(req.body.data.object.metadata);
  const signature = req.headers["stripe-signature"];
  let event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  // console.log(event);

  const check = await BookingModel.findOne({
    _id: event.data.object.metadata.bookingId,
  });
  if (!check) {
    throw new BadRequestError("No Booking Found");
  }
  await PaymentModel.findOneAndUpdate(
    { intentId: event.data.object.id },
    {
      status: "paid",
    }
  );
  await BookingModel.findOneAndUpdate(
    { _id: check._id },
    {
      status: "paid",
    }
  );
  return res
    .status(200)
    .json({ success: true, message: "Payment successfully" });
};
