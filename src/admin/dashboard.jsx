import React, { useEffect, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { AiFillMedicineBox } from "react-icons/ai";
import { MdTimer } from "react-icons/md";
import { IoMdCash } from "react-icons/io";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import styled from "styled-components";
import scrollreveal from "scrollreveal";
import api from "../api"; // Import your configured axios instance

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [totalInventory, setTotalInventory] = useState(0);
  const [totalPendingOrders, setTotalPendingOrders] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [finalCost, setFinalCost] = useState(0);
  const [costSummaryData, setCostSummaryData] = useState([]);

  useEffect(() => {
    const sr = scrollreveal({
      origin: "bottom",
      distance: "100px",
      duration: 2000,
      reset: false,
    });
    sr.reveal(`.nav, .rowOne, .rowTwo`, {
      opacity: 0,
      interval: 100,
    });

    // Fetch data from the backend
    fetchInventory();
    fetchPendingOrders();
    fetchPatients();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get("/inventory");
      setInventory(response.data);
      setTotalInventory(response.data.reduce((acc, item) => acc + item.quantity, 0));
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await api.get("/orders");
      setPendingOrders(response.data);
      setTotalPendingOrders(response.data.length);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data);

      // Calculate total cost and final cost
      const costs = response.data.reduce(
        (acc, patient) => {
          acc.totalCost += parseFloat(patient.total_cost);
          acc.finalCost += parseFloat(patient.final_cost);
          return acc;
        },
        { totalCost: 0, finalCost: 0 }
      );
      setTotalCost(costs.totalCost.toLocaleString("en-US", { style: "currency", currency: "RWF", minimumFractionDigits: 2 }));
      setFinalCost(costs.finalCost.toLocaleString("en-US", { style: "currency", currency: "RWF", minimumFractionDigits: 2 }));

      // Prepare data for the cost summary chart
      const earnings = response.data.map((patient) => ({
        amount: patient.total_cost,
        name: patient.name,
        finalCost: patient.final_cost,
      }));
      setCostSummaryData(earnings);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  return (
    <Section className="nav">
      <TopRow>
        <Card>
          <CardHeader>
            <CardTitle>Total Inventory</CardTitle>
            <CardIcon>
              <AiFillMedicineBox />
            </CardIcon>
          </CardHeader>
          <CardContent>
            <CardValue>{totalInventory}</CardValue>
            <CardDescription>Items in Stock</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Automatic Orders</CardTitle>
            <CardIcon>
              <MdTimer />
            </CardIcon>
          </CardHeader>
          <CardContent>
            <CardValue>{totalPendingOrders}</CardValue>
            <CardDescription>Orders Awaiting Fulfillment</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
            <CardIcon>
              <IoMdCash />
            </CardIcon>
          </CardHeader>
          <CardContent>
            <CardValue>{totalCost}</CardValue>
            <CardDescription>Total Cost for All Patients</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Final Cost</CardTitle>
            <CardIcon>
              <IoMdCash />
            </CardIcon>
          </CardHeader>
          <CardContent>
            <CardValue>{finalCost}</CardValue>
            <CardDescription>Final Cost after Assurance</CardDescription>
          </CardContent>
        </Card>
      </TopRow>
      <Grid>
        <div className="rowOne">
          <InventorySection data={inventory} />
          <CostSummaryChart data={costSummaryData} />
        </div>
        <div className="rowThree">
          <PatientDetails data={patients} />
        </div>
      </Grid>
    </Section>
  );
}

function InventorySection({ data }) {
  return (
    <InventoryWrapper>
      <InventoryItem>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <ResponsiveContainer width="95%" height={250}>
                <BarChart
                  data={data}
                  layout="horizontal" // Layout for upward bars
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis type="number" tickLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="quantity"
                    fill="#4CAF50"
                    barSize={20} // Smaller bar size to fit in reduced width
                    radius={[20, 20, 0, 0]} // Adjust radius for upward bars
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </InventoryItem>
    </InventoryWrapper>
  );
}

function CostSummaryChart({ data }) {
  return (
    <InventoryWrapper>
      <InventoryItem>
        <Card>
          <CardHeader>
            <CardTitle>Cost Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#FF9800"
                    fill="#FFEB3B"
                    name="Total Cost"
                  />
                  <Area
                    type="monotone"
                    dataKey="finalCost"
                    stroke="#4CAF50"
                    fill="#A5D6A7"
                    name="Final Cost"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </InventoryItem>
    </InventoryWrapper>
  );
}

function PatientDetails({ data }) {
  return (
    <Section>
      <TitleContainer>
        <h2>Patient Details & Prescriptions</h2>
      </TitleContainer>
      {data.map((patient, index) => (
        <PatientWrapper key={index}>
          <PatientInfo>
            <h4>{patient.name}</h4>
            <p>Total Cost: {patient.total_cost} RWF</p>
            <p>Final Cost: {patient.final_cost} RWF</p>
            <PrescriptionTable>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Expiration Date</th>
                  <th>Usage Instructions</th>
                  <th>Side Effects</th>
                  <th>Contraindications</th>
                </tr>
              </thead>
              <tbody>
                {JSON.parse(patient.prescription).map((prescription, i) => (
                  <tr key={i}>
                    <td>{prescription.name}</td>
                    <td>{prescription.quantity}</td>
                    <td>{prescription.type}</td>
                    <td>{prescription.price} RWF</td>
                    <td>{new Date(prescription.expiration_date).toLocaleDateString()}</td>
                    <td>{prescription.usage_instructions}</td>
                    <td>{prescription.side_effects}</td>
                    <td>{prescription.contraindications}</td>
                  </tr>
                ))}
              </tbody>
            </PrescriptionTable>
          </PatientInfo>
        </PatientWrapper>
      ))}
    </Section>
  );
}

// Styled Components
const Section = styled.section`
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 2rem;
  margin-top: 2rem;

  .rowOne {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .rowTwo, .rowThree {
    display: flex;
    justify-content: center;
  }

  .rowTwo {
    gap: 2rem;
    margin-bottom: 0; /* Adjusts to remove space */
  }

  .rowThree {
    margin-top: 0; /* Adjusts to remove space */
  }
`;

const TopRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Adjusted to 4 columns */
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  width: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h4`
  color: #4CAF50;
  font-weight: bold;
`;

const CardIcon = styled.div`
  color: #4CAF50;
  font-size: 2rem;
`;

const CardContent = styled.div`
  margin-top: 1rem;
`;

const CardValue = styled.h2`
  color: #333;
  font-size: 2.5rem;
  font-weight: bold;
`;

const CardDescription = styled.p`
  color: #8c8c8c;
  font-size: 0.875rem;
`;

const InventoryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const InventoryItem = styled.div`
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: #4CAF50;
    color: #fff;
  }
`;

const TitleContainer = styled.div`
  margin-bottom: 2rem;

  h2 {
    color: #4CAF50;
  }
`;

const PatientWrapper = styled.div`
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const PatientInfo = styled.div`
  padding: 1rem;
`;

const PrescriptionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #4CAF50;
    color: white;
  }

  tr:hover {
    background-color: #f2f2f2;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px; /* Adjusted height */
`;

