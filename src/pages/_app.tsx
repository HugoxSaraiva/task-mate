import Header from "@/components/Header"
import "../styles/globals.css"
import Layout from "@/components/Layout"
import { useApollo } from "@/lib/client"
import { ApolloProvider } from "@apollo/client"
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState)
  return (
    <ApolloProvider client={apolloClient}>
      {/* <Header /> */}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ApolloProvider>
  )
}
