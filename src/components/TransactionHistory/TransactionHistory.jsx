import st from './TransactionHistory.module.css'

const TransactionHistory = ({items}) => {
  return (
    <table className={st.table}>
       <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Currency</th>
        </tr>
      </thead>
      <tbody>
       {items.map(({id, type, amount, currency})=>(
          <tr key={id}>
            <th>{type}</th>
            <th>{amount}</th>
            <th>{currency}</th>
        </tr>
       ))}
      </tbody>
    </table>
  )
}

export default TransactionHistory