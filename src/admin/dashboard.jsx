import React, { useEffect, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { AiFillMedicineBox } from "react-icons/ai";
import { MdTimer } from "react-icons/md";
import { IoMdCash } from "react-icons/io";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import styled from "styled-components";
import scrollreveal from "scrollreveal";
import api from "../api"; // Import your configured axios instance

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [earningsData, setEarningsData] = useState([]);

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
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const response = await api.get("/orders");
      setPendingOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data);

      // Prepare data for the earnings chart
      const earnings = response.data.map((patient) => ({
        amount: patient.total_cost,
        name: patient.name,
      }));
      setEarningsData(earnings);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  return (
    <Section className="nav">
      <Grid>
        <div className="rowOne">
          <InventorySection data={inventory} />
          <PendingOrders data={pendingOrders} />
        </div>
        <div className="rowTwo">
          <EarningsChart data={earningsData} />
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
      <Slider>
        {data.slice(0, 2).map((item, index) => (
          <InventoryItem key={index}>
            <Content>
              <h5>{item.name}</h5>
              <h2>{item.quantity} units</h2>
              <p>Expires on: {new Date(item.expiration_date).toLocaleDateString()}</p>
            </Content>
            <Logo>
              <AiFillMedicineBox />
            </Logo>
          </InventoryItem>
        ))}
      </Slider>
    </InventoryWrapper>
  );
}

function PendingOrders({ data }) {
  return (
    <Section>
      <TitleContainer>
        <h2>Pending Orders</h2>
      </TitleContainer>
      <OrderContainer>
        {data.map((order, index) => (
          <div className="order" key={index}>
            <div className="info">
              <MdTimer />
              <h4>Order ID: {order.id}</h4>
            </div>
            <IoIosArrowForward />
          </div>
        ))}
      </OrderContainer>
    </Section>
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

function EarningsChart({ data }) {
  return (
    <EarningsContainer>
      <InfoWrapper>
        <h4>This month's earnings from prescriptions</h4>
      </InfoWrapper>

      <Chart>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={data}
            margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <Tooltip cursor={false} />
            <Area
              animationBegin={800}
              animationDuration={2000}
              type="monotone"
              dataKey="amount"
              stroke="#4CAF50"
              fill="#E8F5E9"
              strokeWidth={4}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Chart>
    </EarningsContainer>
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
`;

const InventoryWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Slider = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding: 1rem;
`;

const InventoryItem = styled.div`
  background-color: #ffffff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-width: 280px;
  flex-shrink: 0;
  transition: all 0.3s ease-in-out;

  &:hover {
    background-color: #4CAF50;
    color: #fff;
  }
`;

const Content = styled.div``;

const Logo = styled.div`
  background-color: #4CAF50;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;

  svg {
    font-size: 1.5rem;
    color: #fff;
  }
`;

const TitleContainer = styled.div`
  margin-bottom: 2rem;

  h2 {
    color: #4CAF50;
  }
`;

const OrderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .order {
    background-color: #ffffff;
    padding: 1rem;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease-in-out;

    &:hover {
      background-color: #4CAF50;
      color: #fff;
    }
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

const EarningsContainer = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 20rem;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem 0 0 0;
  width: 80%;
  margin: 0 auto;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;

  h1 {
    font-size: 2rem;
  }
`;

const Chart = styled.div`
  height: 70%;

  .recharts-default-tooltip {
    background-color: #4CAF50 !important;
    border-color: #4CAF50 !important;
  }
`;
