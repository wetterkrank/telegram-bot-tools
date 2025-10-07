<script lang="ts">
  import { Link } from 'svelte5-router';
</script>

<div class="row">
  <div class="col-12">
    <p class="lead mb-4">
      A couple of web-based tools for managing Telegram bots.
    </p>
  </div>
</div>

<div class="row">
  <div class="col-md-6 mb-3">
    <div class="card h-100">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">Bot Names</h5>
        <p class="card-text">
          Update bot name, short description, and long description in multiple languages using CSV format.
        </p>
        <Link to="/bot-names" class="btn btn-primary mt-auto">Update Bot Names</Link>
      </div>
    </div>
  </div>

  <div class="col-md-6 mb-3">
    <div class="card h-100">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">Bot Sender</h5>
        <p class="card-text">
          Send messages to specific chats using your bot token with MarkdownV2 formatting support.
        </p>
        <Link to="/bot-sender" class="btn btn-primary mt-auto">Send Messages</Link>
      </div>
    </div>
  </div>
</div>
