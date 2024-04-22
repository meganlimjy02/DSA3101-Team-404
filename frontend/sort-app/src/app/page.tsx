"use client"
import Image from "next/image";
import styles from "./page.module.css";
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const storedRole = sessionStorage.getItem("storedRole")
    if (storedRole == 'manager') {
      redirect("/management")
    } else if (storedRole == 'staff') {
      redirect("/staff")
    }
    redirect("/login")
  }, [])
}
