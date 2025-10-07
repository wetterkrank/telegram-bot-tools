<script>
  import { Router, Route } from 'svelte5-router';
  import Layout from './components/Layout.svelte';
  import MainPage from './MainPage.svelte';
  import BotNames from './BotNames.svelte';
  import BotSender from './BotSender.svelte';
</script>

<Router>
  <Layout>
    <Route path="/" component={MainPage} />
    <Route path="/bot-names" component={BotNames} />
    <Route path="/bot-sender" component={BotSender} />
  </Layout>
</Router>
