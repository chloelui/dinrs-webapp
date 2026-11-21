import { useState, useEffect, useCallback, useRef } from "react";
import { getConnections, connectUser, disconnectUser } from "../api/users";

export default function useConnections(meId) {
  const [connectedIds, setConnectedIds] = useState([]);
  const pending = useRef(new Set()); // ids w/ request still in flight

  useEffect(() => {
    if (!meId) {
      setConnectedIds([]);
      return;
    }

    let ignore = false;
    getConnections(meId)
      .then((users) => {
        if (!ignore) setConnectedIds(users.map((u) => u.id));
      })
      .catch((err) => console.error(err));

    return () => {ignore = true;};
  }, [meId]);

  const toggleConnect = useCallback(
    async (otherId) => {
      if (!meId) {
        alert("Create a profile first so you can connect with other students.");
        return;
      }
      if (pending.current.has(otherId)) return; // already requested
      pending.current.add(otherId);

      const wasConnected = connectedIds.includes(otherId);

      // Update screen right away w/o waiting for network
      setConnectedIds((ids) =>
        wasConnected ? ids.filter((id) => id !== otherId) : [...ids, otherId]
      );

      try {
        if (wasConnected) await disconnectUser(meId, otherId);
        else await connectUser(meId, otherId);
      } catch (err) {
        console.error(err);
        setConnectedIds((ids) =>
          wasConnected ? [...ids, otherId] : ids.filter((id) => id !== otherId)
        );
        alert(`Couldn't update your connection: ${err.message}`);
      } finally {
        pending.current.delete(otherId);
      }
    },
    [meId, connectedIds]
  );

  return { connectedIds, toggleConnect };
}