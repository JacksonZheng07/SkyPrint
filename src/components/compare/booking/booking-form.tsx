"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { FlightComparisonItem } from "@/lib/types/comparison";
import { formatContrailRisk } from "@/lib/utils/format";

interface BookingFormProps {
  item: FlightComparisonItem;
  price: number;
  isBooking: boolean;
  onConfirm: (phoneNumber: string) => void;
  onCancel: () => void;
}

export function BookingForm({ item, price, isBooking, onConfirm, onCancel }: BookingFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="space-y-5">
      <BookingHeader price={price} />
      <FlightSummary item={item} />
      <PassengerFields email={email} onEmailChange={setEmail} phone={phone} onPhoneChange={setPhone} />
      <PaymentFields />
      <button
        onClick={() => onConfirm(phone)}
        disabled={isBooking || !phone}
        className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        {isBooking ? "Processing..." : `Pay $${price}`}
      </button>
      <p className="text-center text-[10px] text-muted-foreground">
        Secure booking powered by Knot
      </p>
      <button
        onClick={onCancel}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

function BookingHeader({ price }: { price: number }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold">KNOT</h3>
        <p className="text-xs text-muted-foreground">Secure Booking</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">Total</p>
        <p className="text-2xl font-bold">${price}</p>
      </div>
    </div>
  );
}

function FlightSummary({ item }: { item: FlightComparisonItem }) {
  const risk = formatContrailRisk(item.metrics.riskRating);
  const title = item.flight.airline || `${item.flight.airlineCode} ${item.flight.flightNumber}`;
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-sm">{title}</span>
          <p className="text-xs text-muted-foreground">
            {item.flight.origin} → {item.flight.destination}
          </p>
        </div>
        <Badge variant="outline" className={`text-[10px] ${risk.color}`}>
          {risk.label}
        </Badge>
      </div>
    </div>
  );
}

function PassengerFields({
  email,
  onEmailChange,
  phone,
  onPhoneChange,
}: {
  email: string;
  onEmailChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
}) {
  const [fullName, setFullName] = useState("");
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Passenger Details</h4>
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          We&apos;ll text you climate impact updates via iMessage
        </p>
      </div>
    </div>
  );
}

function PaymentFields() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Payment</h4>
      <div>
        <Label htmlFor="card">Card Number</Label>
        <Input
          id="card"
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="expiry">Expiry</Label>
          <Input id="expiry" placeholder="12/28" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input id="cvv" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="zip">Zip Code</Label>
          <Input id="zip" placeholder="10001" value={zip} onChange={(e) => setZip(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
