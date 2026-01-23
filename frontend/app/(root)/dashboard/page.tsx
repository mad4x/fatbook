import React from 'react'
import UserForm from "@/components/UserForm";
import UserList from "@/components/UserList";

const Dashboard = () => {
  return (
    <div className="flex flex-row gap-3">
        <div className="mt-12 ml-5">
            <UserForm />
        </div>

        <div>
            <UserList />
        </div>
    </div>
  )
}
export default Dashboard
